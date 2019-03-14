var
	mfExtend = require( '../mobile.startup/mfExtend' ),
	Overlay = require( '../mobile.startup/Overlay' ),
	PageGateway = require( '../mobile.startup/PageGateway' ),
	util = require( '../mobile.startup/util' ),
	makeAddTopicForm = require( './makeAddTopicForm' ),
	toast = require( '../mobile.startup/toast' ),
	Icon = require( '../mobile.startup/Icon' );

/**
 * Overlay for adding a talk section
 * @class TalkSectionAddOverlay
 * @extends Overlay
 * @uses Toast
 *
 * @param {Object} options Configuration options
 * @param {Object} options.title Title of the talk page being modified
 * @param {Object} options.currentPageTitle Title of the page before the overlay appears
 * @param {OO.EventEmitter} options.eventBus Object used to emit talk-added-wo-overlay
 * and talk-discussion-added events
 */
function TalkSectionAddOverlay( options ) {
	this.editorApi = options.api;
	this.pageGateway = new PageGateway( options.api );
	Overlay.call( this,
		util.extend( options, {
			className: 'talk-overlay overlay',
			events: {
				'click .confirm-save': 'onSaveClick'
			}
		} )
	);
	this.title = options.title;
	this.currentPageTitle = options.currentPageTitle;
	this.eventBus = options.eventBus;
	// Variable to indicate, if the overlay will be closed by the save function
	// or by the user. If this is false and there is content in the input fields,
	// the user will be asked, if he want to abandon his changes before we close
	// the Overlay, otherwise the Overlay will be closed without any question.
	this._saveHit = false;
}

mfExtend( TalkSectionAddOverlay, Overlay, {
	/**
	 * @memberof TalkSectionAddOverlay
	 * @instance
	 * @mixes Overlay#defaults
	 * @property {Object} defaults Default options hash.
	 * @property {string} defaults.cancelMsg Caption for cancel button on edit form.
	 * @property {string} defaults.topicTitlePlaceHolder Placeholder text to prompt user to add
	 * a talk page topic subject.
	 * @property {string} defaults.topicContentPlaceHolder Placeholder text to prompt user
	 *  to add content to talk page content.
	 * @property {string} defaults.editingMsg Label for button which
	 *  submits a new talk page topic.
	 */
	defaults: util.extend( {}, Overlay.prototype.defaults, {
		cancelMsg: mw.msg( 'mobile-frontend-editor-cancel' ),
		editingMsg: mw.msg( 'mobile-frontend-talk-add-overlay-submit' ),
		waitMsg: mw.msg( 'mobile-frontend-talk-topic-wait' ),
		// icons.spinner can't be used, .loading has a fixed height, which breaks overlay-header
		waitIcon: new Icon( {
			name: 'spinner',
			additionalClassNames: 'savespinner loading'
		} ).toHtmlString()
	} ),
	/**
	 * @inheritdoc
	 * @memberof TalkSectionAddOverlay
	 * @instance
	 */
	template: mw.template.get( 'mobile.talk.overlays', 'SectionAddOverlay.hogan' ),
	/**
	 * @inheritdoc
	 * @memberof TalkSectionAddOverlay
	 * @instance
	 */
	templatePartials: util.extend( {}, Overlay.prototype.templatePartials, {
		contentHeader: mw.template.get( 'mobile.talk.overlays', 'SectionAddOverlay/contentHeader.hogan' ),
		saveHeader: mw.template.get( 'mobile.editor.overlay', 'saveHeader.hogan' )
	} ),
	/**
	 * @inheritdoc
	 * @memberof TalkSectionAddOverlay
	 * @instance
	 */
	postRender: function () {
		let topicForm;
		Overlay.prototype.postRender.call( this );
		topicForm = makeAddTopicForm( {
			subject: '',
			body: '',
			disabled: false,
			licenseMsg: this.options.licenseMsg,
			onTextInput: this.onTextInput.bind( this )
		} );
		this.showHidden( '.initial-header' );
		this.$confirm = this.$el.find( 'button.confirm-save' );
		this.$el.find( '.overlay-content' ).append( topicForm.$el );
		this.$subject = topicForm.$el.find( 'input' );
		this.$ta = topicForm.$el.find( '.wikitext-editor' );
	},
	/**
	 * @inheritdoc
	 * @memberof TalkSectionAddOverlay
	 * @instance
	 */
	hide: function () {
		var empty,
			confirmMessage = mw.msg( 'mobile-frontend-editor-cancel-confirm' );

		empty = ( !this.$subject.val() && !this.$ta.val() );
		// TODO: Replace with an OOUI dialog
		if ( this._saveHit || empty || window.confirm( confirmMessage ) ) {
			return Overlay.prototype.hide.apply( this, arguments );
		} else {
			return false;
		}
	},
	/**
	 * Handles an input into a textarea and enables or disables the submit button
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
	 * @memberof TalkSectionAddOverlay
	 * @instance
	 */
	onSaveClick: function () {
		var isOnTalkPage = this.title === this.currentPageTitle;

		this.showHidden( '.saving-header' );
		this.save().then( function ( status ) {
			if ( status === 'ok' ) {
				if ( isOnTalkPage ) {
					this.eventBus.emit( 'talk-added-wo-overlay' );
				} else {
					this.pageGateway.invalidatePage( this.title );
					toast.show( mw.msg( 'mobile-frontend-talk-topic-feedback' ) );
					this.eventBus.emit( 'talk-discussion-added' );
					this.hide();
				}
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

			toast.show( editMsg, { type: 'error' } );
			this.showHidden( '.save-header, .save-panel' );
		}.bind( this ) );
	},
	/**
	 * Save new talk section
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
