( function ( M, $ ) {
	M.require( 'context' ).assertMode( [ 'beta', 'alpha' ] );
	var
		Overlay = M.require( 'Overlay' ),
		api = M.require( 'api' ),
		pageApi = M.require( 'pageApi' ),
		toast = M.require( 'toast' ),
		Icon = M.require( 'Icon' ),
		TalkSectionAddOverlay;

	/**
	 * Overlay for adding a talk section
	 * @class TalkSectionAddOverlay
	 * @extends Overlay
	 * @uses Api
	 * @uses Toast
	 */
	TalkSectionAddOverlay = Overlay.extend( {
		/**
		 * @inheritdoc
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {String} defaults.cancelMsg Caption for cancel button on edit form.
		 * @cfg {String} defaults.topicTitlePlaceHolder Placeholder text to prompt user to add
		 * a talk page topic subject.
		 * @cfg {String} defaults.topicContentPlaceHolder Placeholder text to prompt user to add
		 * content to talk page content.
		 * @cfg {String} defaults.editingMsg Label for button which submits a new talk page topic.
		 */
		defaults: $.extend( {}, Overlay.prototype.defaults, {
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
		template: mw.template.get( 'mobile.talk.overlays', 'SectionAddOverlay.hogan' ),
		templatePartials: {
			contentHeader: mw.template.get( 'mobile.talk.overlays', 'SectionAddOverlay/contentHeader.hogan' ),
			saveHeader: mw.template.get( 'mobile.talk.overlays', 'SectionAddOverlay/saveHeader.hogan' )
		},
		events: $.extend( {}, Overlay.prototype.events, {
			'input .wikitext-editor, .summary': 'onTextInput',
			'change .wikitext-editor, .summary': 'onTextInput',
			'click .confirm-save': 'onSaveClick'
		} ),
		/** @inheritdoc */
		initialize: function ( options ) {
			Overlay.prototype.initialize.apply( this, arguments );
			this.title = options.title;
			// Variable to indicate, if the overlay will be closed by the save function or by the user. If this is false and there is content in the input fields,
			// the user will be asked, if he want to abandon his changes before we close the Overlay, otherwise the Overlay will be closed without any question.
			this._saveHit = false;
		},
		/** @inheritdoc */
		postRender: function ( options ) {
			Overlay.prototype.postRender.call( this, options );
			this.showHidden( '.initial-header' );
			this.$confirm = this.$( 'button.confirm-save' );
			this.$subject = this.$( '.summary' );
			this.$ta = this.$( '.wikitext-editor' );
		},
		/** @inheritdoc */
		hide: function () {
			var empty,
				confirmMessage = mw.msg( 'mobile-frontend-editor-cancel-confirm' );

			empty = ( !this.$subject.val() && !this.$ta.val() );
			if ( this._saveHit || empty || window.confirm( confirmMessage ) ) {
				return Overlay.prototype.hide.apply( this, arguments );
			} else {
				return false;
			}
		},
		/**
		 * Handles an input into a textarea and enables or disables the submit button
		 */
		onTextInput: function () {
			var self = this;

			clearTimeout( this.timer );
			this.timer = setTimeout( function () {
				if ( !self.$ta.val() || !self.$subject.val() ) {
					self.$confirm.prop( 'disabled', true );
				} else {
					self.$confirm.prop( 'disabled', false );
				}
			}, 250 );
		},
		/**
		 * Handles a click on the save button
		 */
		onSaveClick: function () {
			var self = this;

			this.showHidden( '.saving-header' );
			this.save().done( function ( status ) {
				if ( status === 'ok' ) {
					// Check if the user was previously on the talk overlay
					if ( self.title !== mw.config.get( 'wgPageName' ) ) {
						pageApi.invalidatePage( self.title );
						toast.show( mw.msg( 'mobile-frontend-talk-topic-feedback' ), 'toast' );
						M.emit( 'talk-discussion-added' );
						window.history.back();
					} else {
						M.emit( 'talk-added-wo-overlay' );
					}
				}
			} ).fail( function ( error ) {
				var editMsg = 'mobile-frontend-talk-topic-error';

				self.$confirm.prop( 'disabled', false );
				switch ( error.details ) {
					case 'protectedpage':
						editMsg = 'mobile-frontend-talk-topic-error-protected';
						break;
					case 'noedit':
					case 'blocked':
						editMsg = 'mobile-frontend-talk-topic-error-permission';
						break;
					case 'spamdetected':
						editMsg = 'mobile-frontend-talk-topic-error-spam';
						break;
					case 'badtoken':
						editMsg = 'mobile-frontend-talk-topic-error-badtoken';
						break;
					default:
						editMsg = 'mobile-frontend-talk-topic-error';
						break;
				}

				toast.show( mw.msg( editMsg ), 'toast error' );
				self.showHidden( '.save-header, .save-panel' );
			} );
		},
		/**
		 * Save new talk section
		 * @method
		 * @return {jQuery.Deferred} Object that either will be resolved with ok parameter
		 * or rejected with type error.
		 */
		save: function () {
			var heading = this.$subject.val(),
				self = this,
				text = this.$ta.val(),
				result = $.Deferred();
			this.$ta.removeClass( 'error' );
			this.$subject.removeClass( 'error' );

			// propagate, that we save an edit and want to close the Overlay without any interruption (user questions e.g.)
			this._saveHit = true;

			this.$( '.content' ).empty().addClass( 'loading' );
			// FIXME: while saving: a spinner would be nice
			api.postWithToken( 'edit', {
				action: 'edit',
				section: 'new',
				sectiontitle: heading,
				title: self.title,
				summary: mw.msg( 'mobile-frontend-talk-edit-summary', heading ),
				text: text + ' ~~~~'
			} ).done( function () {
				result.resolve( 'ok' );
			} ).fail( function ( msg ) {
				result.reject( {
					type: 'error',
					details: msg
				} );
			} );

			return result;
		}
	} );

	M.define( 'modules/talk/TalkSectionAddOverlay', TalkSectionAddOverlay );

}( mw.mobileFrontend, jQuery ) );
