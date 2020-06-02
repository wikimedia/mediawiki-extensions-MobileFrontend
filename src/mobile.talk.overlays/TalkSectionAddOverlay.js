var
	mfExtend = require( '../mobile.startup/mfExtend' ),
	headers = require( '../mobile.startup/headers' ),
	Overlay = require( '../mobile.startup/Overlay' ),
	PageGateway = require( '../mobile.startup/PageGateway' ),
	util = require( '../mobile.startup/util' ),
	makeAddTopicForm = require( './makeAddTopicForm' );

/**
 * Overlay for adding a talk section
 *
 * @class TalkSectionAddOverlay
 * @extends Overlay
 *
 * @param {Object} options Configuration options
 * @param {mw.Api} options.api
 * @param {Object} options.title Title of the talk page being modified
 * @param {string} options.licenseMsg
 * @param {Object} options.currentPageTitle Title of the page before the overlay appears
 * @param {Function} [options.onSaveComplete] executed when a save has completed
 * and talk-discussion-added events
 */
function TalkSectionAddOverlay( options ) {
	this.editorApi = options.api;
	this.pageGateway = new PageGateway( options.api );
	Overlay.call( this,
		util.extend( options, {
			className: 'talk-overlay overlay',
			onBeforeExit: this.onBeforeExit.bind( this ),
			events: {
				'click .save': 'onSaveClick'
			}
		} )
	);
	this.onSaveComplete = options.onSaveComplete;
	this.title = options.title;
	this.currentPageTitle = options.currentPageTitle;
	// Variable to indicate, if the overlay will be closed by the save function
	// or by the user. If this is false and there is content in the input fields,
	// the user will be asked, if he want to abandon his changes before we close
	// the Overlay, otherwise the Overlay will be closed without any question.
	this._saveHit = false;
}

mfExtend( TalkSectionAddOverlay, Overlay, {
	preRender: function () {
		this.options.headers = [
			// contentHeader
			headers.saveHeader(
				mw.msg( 'mobile-frontend-talk-add-overlay-submit' ),
				'initial-header save-header'
			),
			headers.savingHeader( mw.msg( 'mobile-frontend-talk-topic-wait' ) )
		];
	},
	/**
	 * @inheritdoc
	 * @memberof TalkSectionAddOverlay
	 * @instance
	 */
	postRender: function () {
		Overlay.prototype.postRender.call( this );
		const topicForm = makeAddTopicForm( {
			subject: '',
			body: '',
			disabled: false,
			licenseMsg: this.options.licenseMsg,
			onTextInput: this.onTextInput.bind( this )
		} );
		this.showHidden( '.initial-header' );
		this.$confirm = this.$el.find( 'button.save' );
		this.$el.find( '.overlay-content' ).append( topicForm.$el );
		this.$subject = topicForm.$el.find( 'input' );
		this.$ta = topicForm.$el.find( '.wikitext-editor' );
	},
	/**
	 * @inheritdoc
	 * @memberof TalkSectionAddOverlay
	 * @instance
	 */
	onBeforeExit: function ( exit ) {
		var empty,
			confirmMessage = mw.msg( 'mobile-frontend-editor-cancel-confirm' );

		empty = ( !this.$subject.val() && !this.$ta.val() );
		// TODO: Replace with an OOUI dialog
		// eslint-disable-next-line no-alert
		if ( this._saveHit || empty || window.confirm( confirmMessage ) ) {
			exit();
		}
	},
	/**
	 * Handles an input into a textarea and enables or disables the submit button
	 *
	 * @memberof TalkSectionAddOverlay
	 * @param {string} subject
	 * @param {string} body
	 * @instance
	 */
	onTextInput: function ( subject, body ) {
		this.subject = subject;
		this.body = body;

		clearTimeout( this.timer );
		this.timer = setTimeout( function () {
			if ( !body || !subject ) {
				this.$confirm.prop( 'disabled', true );
			} else {
				this.$confirm.prop( 'disabled', false );
			}
		}.bind( this ), 250 );
	},
	/**
	 * Handles a click on the save button
	 *
	 * @memberof TalkSectionAddOverlay
	 * @instance
	 */
	onSaveClick: function () {
		this.showHidden( '.saving-header' );
		this.save().then( function ( status ) {
			if ( status === 'ok' && this.options.onSaveComplete ) {
				this.onSaveComplete();
			}
		}.bind( this ), function ( error ) {
			var editMsg = mw.msg( 'mobile-frontend-talk-topic-error' );

			this.$confirm.prop( 'disabled', false );
			switch ( error.details ) {
				case 'protectedpage':
					editMsg = mw.msg( 'mobile-frontend-talk-topic-error-protected' );
					break;
				case 'noedit':
				case 'blocked':
					editMsg = mw.msg( 'mobile-frontend-talk-topic-error-permission' );
					break;
				case 'spamdetected':
					editMsg = mw.msg( 'mobile-frontend-talk-topic-error-spam' );
					break;
				case 'badtoken':
					editMsg = mw.msg( 'mobile-frontend-talk-topic-error-badtoken' );
					break;
				default:
					editMsg = mw.msg( 'mobile-frontend-talk-topic-error' );
					break;
			}

			mw.notify( editMsg, { type: 'error' } );
			this.showHidden( '.save-header, .save-panel' );
		}.bind( this ) );
	},
	/**
	 * Save new talk section
	 *
	 * @memberof TalkSectionAddOverlay
	 * @instance
	 * @return {jQuery.Deferred} Object that either will be resolved with ok parameter
	 * or rejected with type error.
	 */
	save: function () {
		var heading = this.subject,
			d = util.Deferred();

		this.$ta.removeClass( 'error' );
		this.$subject.removeClass( 'error' );

		// propagate, that we save an edit and want to close the Overlay without
		// any interruption (user questions e.g.)
		this._saveHit = true;

		this.$el.find( '.content' ).empty().addClass( 'loading' );
		// FIXME: while saving: a spinner would be nice
		// FIXME: This should be using a gateway e.g. TalkGateway, PageGateway or EditorGateway
		return this.editorApi.postWithToken( 'csrf', {
			action: 'edit',
			section: 'new',
			sectiontitle: heading,
			title: this.title,
			summary: mw.msg( 'newsectionsummary', heading ),
			text: this.body
		} ).then( function () {
			return 'ok';
		}, function ( msg ) {
			// FIXME: Throw an Error
			return d.reject( {
				type: 'error',
				details: msg
			} );
		} );
	}
} );

module.exports = TalkSectionAddOverlay;
