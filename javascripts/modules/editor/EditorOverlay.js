( function ( M, $ ) {
	var EditorOverlayBase = M.require( 'modules/editor/EditorOverlayBase' ),
		Section = M.require( 'Section' ),
		EditorApi = M.require( 'modules/editor/EditorApi' ),
		AbuseFilterPanel = M.require( 'modules/editor/AbuseFilterPanel' ),
		settings = M.require( 'settings' ),
		browser = M.require( 'browser' ),
		overlayManager = M.require( 'overlayManager' ),
		EditorOverlay;

	/**
	 * Overlay that shows an editor
	 * @class EditorOverlay
	 * @uses Section
	 * @uses AbuseFilterPanel
	 * @uses EditorApi
	 * @uses VisualEditorOverlay
	 * @extends EditorOverlayBase
	 */
	EditorOverlay = EditorOverlayBase.extend( {
		templatePartials: $.extend( {}, EditorOverlayBase.prototype.templatePartials, {
			content: mw.template.get( 'mobile.editor.overlay', 'content.hogan' ),
			anonWarning: mw.template.get( 'mobile.editor.common', 'EditorOverlayAnonWarning.hogan' )
		} ),
		/**
		 * @inheritdoc
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {String} defaults.loginCaption A link with label to login page.
		 * @cfg {String} defaults.signupCaption A link with label to sign up page.
		 * @cfg {String} defaults.anonLabel Title for link to edit a page without logging in.
		 * @cfg {String} defaults.anonSelector CSS class name of the defaults.anonLabel wrapper.
		 * @cfg {String} defaults.anonMsg Warning message, when user want to edit without
		 * logging in.
		 */
		defaults: $.extend( {}, EditorOverlayBase.prototype.defaults, {
			loginCaption: mw.msg( 'mobile-frontend-watchlist-cta-button-login' ),
			signupCaption: mw.msg( 'mobile-frontend-watchlist-cta-button-signup' ),
			anonLabel: mw.msg( 'mobile-frontend-editor-anon' ),
			// the "edit without logging in" link needs a second class to distinguish it with the "Next" button
			anonSelector: 'continue anonymous',
			anonMsg: mw.msg( 'mobile-frontend-editor-anonwarning' )
		} ),
		editor: 'SourceEditor',
		sectionLine: '',

		/**
		 * Check whether VisualEditor is enabled or not.
		 * @method
		 * @return {Boolean}
		 */
		isVisualEditorEnabled: function () {
			return browser.isWideScreen() &&
				mw.config.get( 'wgVisualEditorConfig' ) &&
				$.inArray( mw.config.get( 'wgNamespaceNumber' ), mw.config.get( 'wgVisualEditorConfig' ).namespaces ) > -1 &&
				mw.config.get( 'wgTranslatePageTranslation' ) !== 'translation' &&
				mw.config.get( 'wgPageContentModel' ) === 'wikitext';
		},

		/** @inheritdoc **/
		initialize: function ( options ) {
			this.api = new EditorApi( {
				title: options.title,
				sectionId: options.sectionId,
				oldId: options.oldId,
				isNewPage: options.isNewPage
			} );
			this.readOnly = options.oldId ? true : false; // If old revision, readOnly mode
			if ( this.isVisualEditorEnabled() ) {
				options.editSwitcher = true;
			}
			if ( this.readOnly ) {
				options.readOnly = true;
				options.editingMsg = mw.msg( 'mobile-frontend-editor-viewing-source-page', options.title );
			} else {
				options.editingMsg = mw.msg( 'mobile-frontend-editor-editing-page', options.title );
			}
			if ( options.isAnon ) {
				// add required data for anonymous editing warning
				options = this._prepareAnonWarning( options );
			}
			// be explicit here. This may have been initialized from VE.
			options.isVisualEditor = false;
			options.previewingMsg = mw.msg( 'mobile-frontend-editor-previewing-page', options.title );
			EditorOverlayBase.prototype.initialize.apply( this, arguments );
		},
		events: $.extend( {}, EditorOverlayBase.prototype.events, {
			'input .wikitext-editor': 'onInputWikitextEditor'
		} ),
		/**
		 * Wikitext Editor input handler
		 */
		onInputWikitextEditor: function () {
			this.api.setContent( this.$( '.wikitext-editor' ).val() );
			this.$( '.continue, .submit' ).prop( 'disabled', false );
		},
		/**
		 * @inheritdoc
		 */
		onClickContinue: function ( ev ) {
			// handle the click on "Edit without logging in"
			if ( this.options.isAnon && $( ev.target ).hasClass( 'anonymous' ) ) {
				this._showEditorAfterWarning();
				return false;
			}
			EditorOverlayBase.prototype.onClickContinue.apply( this, arguments );
		},
		/**
		 * @inheritdoc
		 */
		onClickBack: function () {
			EditorOverlayBase.prototype.onClickBack.apply( this, arguments );
			this._hidePreview();
		},
		/** @inheritdoc **/
		postRender: function ( options ) {
			var self = this;

			if ( this.isVisualEditorEnabled() ) {
				this.initializeSwitcher();
				this.switcherToolbar.tools.editSource.setActive( true );
				/**
				 * 'Edit' button handler
				 */
				this.switcherToolbar.tools.editVe.onSelect = function () {
					// If the user tries to switch to the VisualEditor, check if any changes have
					// been made, and if so, tell the user they have to save first.
					if ( !self.api.hasChanged ) {
						self._switchToVisualEditor( self.options );
					} else {
						if ( window.confirm( mw.msg( 'mobile-frontend-editor-switch-confirm' ) ) ) {
							self.onStageChanges();
						} else {
							self.switcherToolbar.tools.editVe.setActive( false );
						}
					}
				};
			}

			EditorOverlayBase.prototype.postRender.apply( this, arguments );

			this.$preview = this.$( '.preview' );
			this.$content = this.$( '.wikitext-editor' );
			if ( options.isAnon ) {
				this.$anonWarning = this.$( '.anonwarning' );
				this.$content.hide();
				// the user has to click login, signup or edit without login, disable "Next" button on top right
				this.$anonHiddenButtons = this.$( '.overlay-header .continue, .editor-switcher' ).hide();
				this.clearSpinner();
			}
			// make license links open in separate tabs
			this.$( '.license a' ).attr( 'target', '_blank' );

			this.abuseFilterPanel = new AbuseFilterPanel().appendTo( this.$( '.panels' ) );

			// If in readOnly mode, make textarea readonly
			if ( this.readOnly ) {
				this.$content.prop( 'readonly', true );
			}

			if ( !options.isAnon ) {
				this._loadContent();
			}
		},

		/**
		 * Sets additional values used for anonymous editing warning.
		 * @method
		 * @private
		 * @param {Object} options object
		 * @return {Object} Object with all options
		 */
		_prepareAnonWarning: function ( options ) {
			var params = $.extend( {
				// use wgPageName as this includes the namespace if outside Main
				returnto: options.returnTo || mw.config.get( 'wgPageName' ),
				returntoquery: 'action=edit&section=' + options.sectionId
			}, options.queryParams ),
			signupParams = $.extend( {
				type: 'signup'
			}, options.signupQueryParams );

			options.loginUrl = mw.util.getUrl( 'Special:UserLogin', params );
			options.signupUrl = mw.util.getUrl( 'Special:UserLogin', $.extend( params, signupParams ) );

			return options;
		},

		/**
		 * Handles click on "Edit without login" in anonymous editing warning.
		 * @method
		 * @private
		 */
		_showEditorAfterWarning: function () {
			this.showSpinner();
			this.$anonWarning.hide();
			// reenable "Next" button
			this.$anonHiddenButtons.show();
			this._loadContent();
		},

		/**
		 * Prepares the preview interface and reveals the save screen of the overlay
		 * @method
		 * @inheritdoc
		 */
		onStageChanges: function () {
			var self = this,
				params = {
					text: this.getContent()
				};

			this.scrollTop = $( 'body' ).scrollTop();
			this.$content.hide();
			this.showSpinner();

			if ( mw.config.get( 'wgIsMainPage' ) ) {
				params.mainpage = 1; // Setting it to 0 will have the same effect
			}
			this.api.getPreview( params ).done( function ( parsedText, parsedSectionLine ) {
				// On desktop edit summaries strip tags. Mimic this behavior on mobile devices
				self.sectionLine = $( '<div/>' ).html( parsedSectionLine ).text();
				new Section( {
					el: self.$preview,
					text: parsedText
				// bug 49218: stop links from being clickable (note user can still hold down to navigate to them)
				} ).$( 'a' ).on( 'click', false );
				// Emit event so we can perform enhancements to page
				M.emit( 'edit-preview', self );
			} ).fail( function () {
				self.$preview.addClass( 'error' ).text( mw.msg( 'mobile-frontend-editor-error-preview' ) );
			} ).always( function () {
				self.clearSpinner();
				self.$preview.show();
			} );

			EditorOverlayBase.prototype.onStageChanges.apply( this, arguments );
		},

		/**
		 * Hides the preview and reverts back to initial screen.
		 * @method
		 * @private
		 */
		_hidePreview: function () {
			this.api.abort();
			this.clearSpinner();
			this.$preview.removeClass( 'error' ).hide();
			this.$content.show();
			window.scrollTo( 0, this.scrollTop );
			this.showHidden( '.initial-header' );
			this.abuseFilterPanel.hide();
		},

		/**
		 * Set content to the user input field.
		 * @param {String} content The content to set.
		 */
		setContent: function ( content ) {
			this.$content
				.show()
				.val( content )
				.microAutosize();
		},

		/**
		 * Returns the content of the user input field.
		 * @return {String}
		 */
		getContent: function () {
			return this.$content.val();
		},

		/**
		 * Requests content from the API and reveals it in UI.
		 * @method
		 * @private
		 */
		_loadContent: function () {
			var self = this;

			this.$content.hide();
			this.showSpinner();

			this.api.getContent()
				.done( function ( content ) {
					self.setContent( content );
					self.clearSpinner();
				} )
				.fail( function ( error ) {
					self.reportError( mw.msg( 'mobile-frontend-editor-error-loading' ), error );
				} );
		},

		/**
		 * Loads a {VisualEditorOverlay} and replaces the existing EditorOverlay with it
		 * based on the current option values.
		 * @method
		 * @private
		 * @param {Object} options Object passed to the constructor
		 */
		_switchToVisualEditor: function ( options ) {
			var self = this;
			this.log( 'switch' );
			// Save a user setting indicating that this user prefers using the VisualEditor
			settings.save( 'preferredEditor', 'VisualEditor', true );
			// Load the VisualEditor and replace the SourceEditor overlay with it
			this.showSpinner();
			this.$content.hide();
			mw.loader.using(
				'mobile.editor.ve',
				function () {
					var VisualEditorOverlay = M.require( 'modules/editor/VisualEditorOverlay' );

					self.clearSpinner();
					overlayManager.replaceCurrent( new VisualEditorOverlay( options ) );
				},
				function () {
					self.clearSpinner();
					self.$content.show();
					self.switcherToolbar.tools.editVe.setActive( false );
					// FIXME: We should show an error notification, but right now toast
					// notifications are not dismissible when shown within the editor.
				}
			);
		},

		/**
		 * Reveals an abuse filter panel inside the view.
		 * @method
		 * @private
		 * @param {String} type The type of alert, e.g. 'warning' or 'disallow'
		 * @param {String} message Message to show in the AbuseFilter overlay
		 */
		_showAbuseFilter: function ( type, message ) {
			this.abuseFilterPanel.show( type, message );
			this.showHidden( '.save-header' );
			// disable continue and save buttons, reenabled when user changes content
			this.$( '.continue, .submit' ).prop( 'disabled', this.abuseFilterPanel.isDisallowed );
		},

		/**
		 * Executed when the editor clicks the save button. Handles logging and submitting
		 * the save action to the editor API.
		 * @inheritdoc
		 */
		onSaveBegin: function () {
			var self = this,
				options = {
					summary: this.$( '.summary' ).val()
				};

			if ( self.sectionLine !== '' ) {
				options.summary = '/* ' + self.sectionLine + ' */' + options.summary;
			}
			EditorOverlayBase.prototype.onSaveBegin.apply( this, arguments );
			if ( this.confirmAborted ) {
				return;
			}
			if ( this.captchaId ) {
				options.captchaId = this.captchaId;
				options.captchaWord = this.$( '.captcha-word' ).val();
			}

			this.showHidden( '.saving-header' );

			this.api.save( options )
				.done( function () {
					var title = self.options.title;
					// Special case behaviour of main page
					if ( mw.config.get( 'wgIsMainPage' ) ) {
						window.location = mw.util.getUrl( title );
						return;
					}

					self.onSaveComplete();
				} )
				.fail( function ( data, code, response ) {
					var msg,
						// When save failed with one of these error codes, the returned
						// message in response.error.info will be forwarded to the user.
						// FIXME: This shouldn't be needed when info texts are all localized.
						whitelistedErrorInfo = [
							'readonly',
							'blocked',
							'autoblocked'
						];

					if ( data.type === 'captcha' ) {
						self.captchaId = data.details.id;
						// FIXME: Don't call a private method that is outside the class.
						self._showCaptcha( data.details.url );
					} else if ( data.type === 'abusefilter' ) {
						self._showAbuseFilter( data.details.type, data.details.message );
					} else {
						if ( data.details === 'editconflict' ) {
							msg = mw.msg( 'mobile-frontend-editor-error-conflict' );
						} else if (
							response.error &&
							$.inArray( response.error.code, whitelistedErrorInfo ) > -1
						) {
							msg = response.error.info;
						} else {
							msg = mw.msg( 'mobile-frontend-editor-error' );
						}

						self.reportError( msg, data.details );
						self.showHidden( '.save-header, .save-panel' );
					}
				} );
		},

		/**
		 * Checks whether the existing content has changed.
		 * @method
		 * @return {Boolean}
		 */
		hasChanged: function () {
			return this.api.hasChanged;
		}
	} );

	M.define( 'modules/editor/EditorOverlay', EditorOverlay );
}( mw.mobileFrontend, jQuery ) );
