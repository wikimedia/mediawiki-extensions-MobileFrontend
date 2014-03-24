( function( M, $ ) {
	var EditorOverlayBase = M.require( 'modules/editor/EditorOverlayBase' ),
		popup = M.require( 'toast' ),
		schema = M.require( 'loggingSchemas/mobileWebEditing' ),
		MobileWebClickTracking = M.require( 'loggingSchemas/MobileWebClickTracking' ),
		inBetaOrAlpha = M.isBetaGroupMember(),
		isVisualEditorEnabled = M.isWideScreen() && M.isAlphaGroupMember() &&
			mw.config.get( 'wgVisualEditorConfig' ),
		inKeepGoingCampaign = M.query.campaign === 'mobile-keepgoing',
		inNavSignupCampaign = M.query.campaign === 'leftNavSignup',
		Section = M.require( 'Section' ),
		EditorApi = M.require( 'modules/editor/EditorApi' ),
		AbuseFilterPanel = M.require( 'modules/editor/AbuseFilterPanel' ),
		mobileLeftNavbarEditCTA = M.require( 'loggingSchemas/mobileLeftNavbarEditCTA' ),
		EditorOverlay;

	/**
	 * @class EditorOverlay
	 * @extends EditorOverlayBase
	 */
	EditorOverlay = EditorOverlayBase.extend( {
		templatePartials: {
			header: M.template.get( 'modules/editor/EditorOverlayHeader' ),
			content: M.template.get( 'modules/editor/EditorOverlay' )
		},
		log: function( action, errorText ) {
			var
				data = {
					action: action,
					section: this.sectionId,
					funnel: this.funnel
				};
			if ( errorText ) {
				data.errorText = errorText;
			}
			schema.log( data );
		},

		initialize: function( options ) {
			this.api = new EditorApi( {
				title: options.title,
				sectionId: options.sectionId,
				oldId: options.oldId,
				isNewPage: options.isNewPage
			} );
			this.readOnly = options.oldId ? true : false; // If old revision, readOnly mode
			this.funnel = options.funnel;
			if ( isVisualEditorEnabled ) {
				options.editSwitcher = true;
			}
			this._super( options );
			if ( isVisualEditorEnabled ) {
				this.initializeSwitcher();
			}
		},

		postRender: function( options ) {
			var self = this;
			this._super( options );

			this.$spinner = this.$( '.spinner' );
			this.$preview = this.$( '.preview' );
			this.$content = this.$( 'textarea' ).
				on( 'input', function() {
					self.api.setContent( self.$content.val() );
					self.$( '.continue, .submit' ).prop( 'disabled', false );
				} );
			this.$( '.continue' ).on( M.tapEvent( 'click' ), $.proxy( this, '_showPreview' ) );
			this.$( '.back' ).on( M.tapEvent( 'click' ), $.proxy( this, '_hidePreview' ) );
			this.$( '.submit' ).on( M.tapEvent( 'click' ), $.proxy( this, '_save' ) );
			this.$( '.cancel' ).on( M.tapEvent( 'click' ), function() {
				// log cancel attempt
				self.log( 'cancel' );
			} );
			// make license links open in separate tabs
			this.$( '.license a' ).attr( 'target', '_blank' );

			if ( isVisualEditorEnabled ) {
				this.$( '.visual-editor' ).on( 'click', function() {
					// If changes have been made tell the user they have to save first
					if ( !self.api.hasChanged ) {
						MobileWebClickTracking.log( 'editor-switch-to-visual', options.title );
						self._switchToVisualEditor( options );
					} else {
						if ( window.confirm( mw.msg( 'mobile-frontend-editor-switch-confirm' ) ) ) {
							self._showPreview();
						}
					}
				} );
			}

			this.abuseFilterPanel = new AbuseFilterPanel().appendTo( this.$( '.panels' ) );

			// If in readOnly mode, make textarea readonly
			if ( this.readOnly ) {
				this.$content.prop( 'readonly', true );
			}

			this._loadContent();
			// log section edit attempt
			self.log( 'attempt' );
			if ( inNavSignupCampaign ) {
				// Log edit page impression
				mobileLeftNavbarEditCTA.log( {
					action: 'page-edit-impression'
				} );
			}
		},

		_shouldShowKeepGoingOverlay: function() {
			if ( inBetaOrAlpha &&
				mw.config.get( 'wgMFKeepGoing' ) &&
				( this.editCount === 0 || inKeepGoingCampaign )
			) {
				return true;
			} else {
				return false;
			}
		},

		_showPreview: function() {
			var self = this, params = { text: this.$content.val() };

			// log save button click
			this.log( 'save' );
			this._showHidden( '.save-header, .save-panel' );

			this.scrollTop = $( 'body' ).scrollTop();
			this.$content.hide();
			this.$spinner.show();

			// pre-fetch keep going with expectation user will go on to save
			if ( this._shouldShowKeepGoingOverlay() ) {
				this._keepgoing = true;
				mw.loader.using( 'mobile.keepgoing' );
			}

			if ( mw.config.get( 'wgIsMainPage' ) ) {
				params.mainpage = 1; // Setting it to 0 will have the same effect
			}
			this.api.getPreview( params ).done( function( parsedText ) {
				new Section( {
					el: self.$preview,
					content: parsedText
				// bug 49218: stop links from being clickable (note user can still hold down to navigate to them)
				} ).$( 'a' ).on( 'click', false );
				// Emit event so we can perform enhancements to page
				M.emit( 'edit-preview', self );
			} ).fail( function() {
				self.$preview.addClass( 'error' ).text( mw.msg( 'mobile-frontend-editor-error-preview' ) );
			} ).always( function() {
				self.$spinner.hide();
				self.$preview.show();
			} );
		},

		_hidePreview: function() {
			this.api.abort();
			this.$spinner.hide();
			this.$preview.removeClass( 'error' ).hide();
			this.$content.show();
			window.scrollTo( 0, this.scrollTop );
			this._showHidden( '.initial-header' );
			this.abuseFilterPanel.hide();
		},

		_loadContent: function() {
			var self = this;

			this.$content.hide();
			this.$spinner.show();

			this.api.getContent().
				done( function( content ) {
					self.$content.
						show().
						val( content ).
						microAutosize();
					self.$spinner.hide();
				} ).
				fail( function( error ) {
					popup.show( mw.msg( 'mobile-frontend-editor-error-loading' ), 'toast error' );
					// log error that occurred in retrieving section
					self.log( 'error', error );
				} );
		},

		_switchToVisualEditor: function( options ) {
			// Save a user setting indicating that this user prefers using the VisualEditor
			M.settings.saveUserSetting( 'preferredEditor', 'VisualEditor', true );
			// Load the VisualEditor and replace the SourceEditor overlay with it
			mw.loader.using( 'mobile.editor.ve', function() {
				var VisualEditorOverlay = M.require( 'modules/editor/VisualEditorOverlay' );
				M.overlayManager.replaceCurrent( new VisualEditorOverlay( options ) );
			} );
		},

		_updateEditCount: function() {
			this.editCount += 1;
			mw.config.set( 'wgUserEditCount', this.editCount );
		},

		_showAbuseFilter: function( type, message ) {
			this.abuseFilterPanel.show( type, message );
			this._showHidden( '.save-header' );
			// disable continue and save buttons, reenabled when user changes content
			this.$( '.continue, .submit' ).prop( 'disabled', this.abuseFilterPanel.isDisallowed );
		},

		/**
		 * Executed when the editor clicks the save button. Handles logging and submitting
		 * the save action to the editor API.
		 */
		_save: function() {
			var self = this,
				options = { summary: this.$( '.summary' ).val() };

			// Ask for confirmation in some cases
			if ( !this.confirmSave() ) {
				return;
			}

			if ( this.captchaId ) {
				options.captchaId = this.captchaId;
				options.captchaWord = this.$( '.captcha-word' ).val();
			}

			self.log( 'submit' );
			if ( inNavSignupCampaign ) {
				mobileLeftNavbarEditCTA.log( {
					action: 'page-save-attempt',
				} );
			}
			this._showHidden( '.saving-header' );

			this.api.save( options ).
				done( function() {
					var title = self.options.title;
					// Special case behaviour of main page
					if ( mw.config.get( 'wgIsMainPage' ) ) {
						window.location = mw.util.getUrl( title );
						return;
					}

					// log success!
					self.log( 'success' );
					if ( inNavSignupCampaign ) {
						mobileLeftNavbarEditCTA.log( {
							action: 'page-save-success',
						} );
					}
					self.onSave();
				} ).
				fail( function( data ) {
					var msg;

					if ( data.type === 'captcha' ) {
						self.captchaId = data.details.id;
						self._showCaptcha( data.details.url );
					} else if ( data.type === 'abusefilter' ) {
						self._showAbuseFilter( data.details.type, data.details.message );
					} else {
						if ( data.details === 'editconflict' ) {
							msg = mw.msg( 'mobile-frontend-editor-error-conflict' );
						} else {
							msg = mw.msg( 'mobile-frontend-editor-error' );
						}

						popup.show( msg, 'toast error' );
						self._showHidden( '.save-header, .save-panel' );
						// log error that occurred in retrieving section
						self.log( 'error', data.details );
					}
				} );
		},
		_hasChanged: function () {
			return this.api.hasChanged;
		}
	} );

	M.define( 'modules/editor/EditorOverlay', EditorOverlay );
}( mw.mobileFrontend, jQuery ) );
