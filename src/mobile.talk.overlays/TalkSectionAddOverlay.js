var
	mfExtend = require( '../mobile.startup/mfExtend' ),
	Overlay = require( '../mobile.startup/Overlay' ),
	PageGateway = require( '../mobile.startup/PageGateway' ),
	util = require( '../mobile.startup/util' ),
	autosign = require( './autosign' ),
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
				'input .wikitext-editor, .summary': 'onTextInput',
				'change .wikitext-editor, .summary': 'onTextInput',
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
		topicTitlePlaceHolder: mw.msg( 'mobile-frontend-talk-add-overlay-subject-placeholder' ),
		topicContentPlaceHolder: mw.msg( 'mobile-frontend-talk-add-overlay-content-placeholder' ),
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
		Overlay.prototype.postRender.call( this );
		this.showHidden( '.initial-header' );
		this.$confirm = this.$el.find( 'button.confirm-save' );
		this.$subject = this.$el.find( '.summary' );
		this.$ta = this.$el.find( '.wikitext-editor' );
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
	 * @instance
	 */
	onTextInput: function () {
		var self = this;

		clearTimeout( this.timer );
		this.timer = setTimeout( function () {
			if ( !self.$ta.val().trim() || !self.$subject.val().trim() ) {
				self.$confirm.prop( 'disabled', true );
			} else {
				self.$confirm.prop( 'disabled', false );
			}
		}, 250 );
	},
	/**
	 * Handles a click on the save button
	 * @memberof TalkSectionAddOverlay
	 * @instance
	 */
	onSaveClick: function () {
		var self = this,
			isOnTalkPage = self.title === self.currentPageTitle;

		this.showHidden( '.saving-header' );
		this.save().then( function ( status ) {
			if ( status === 'ok' ) {
				if ( isOnTalkPage ) {
					self.eventBus.emit( 'talk-added-wo-overlay' );
				} else {
					self.pageGateway.invalidatePage( self.title );
					toast.show( mw.msg( 'mobile-frontend-talk-topic-feedback' ) );
					self.eventBus.emit( 'talk-discussion-added' );
					self.hide();
				}
			}
		}, function ( error ) {
			var editMsg = mw.msg( 'mobile-frontend-talk-topic-error' );

			self.$confirm.prop( 'disabled', false );
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
			self.showHidden( '.save-header, .save-panel' );
		} );
	},
	/**
	 * Save new talk section
	 * @memberof TalkSectionAddOverlay
	 * @instance
	 * @return {jQuery.Deferred} Object that either will be resolved with ok parameter
	 * or rejected with type error.
	 */
	save: function () {
		var heading = this.$subject.val(),
			self = this,
			d = util.Deferred(),
			text = this.$ta.val();

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
			title: self.title,
			summary: mw.msg( 'newsectionsummary', heading ),
			text: autosign( text )
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
