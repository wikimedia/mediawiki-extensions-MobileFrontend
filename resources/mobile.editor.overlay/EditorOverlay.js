( function ( M ) {
	var EditorOverlayBase = M.require( 'mobile.editor.common/EditorOverlayBase' ),
		util = M.require( 'mobile.startup/util' ),
		Section = M.require( 'mobile.startup/Section' ),
		EditorGateway = M.require( 'mobile.editor.api/EditorGateway' ),
		AbuseFilterPanel = M.require( 'mobile.editor.common/AbuseFilterPanel' ),
		Button = M.require( 'mobile.startup/Button' ),
		toast = M.require( 'mobile.startup/toast' ),
		MessageBox = M.require( 'mobile.messageBox/MessageBox' );

	/**
	 * Overlay that shows an editor
	 * @class EditorOverlay
	 * @uses Section
	 * @uses AbuseFilterPanel
	 * @uses EditorGateway
	 * @uses VisualEditorOverlay
	 * @extends EditorOverlayBase
	 *
	 * @constructor
	 * @param {Object} options Configuration options
	 */
	function EditorOverlay( options ) {
		this.gateway = new EditorGateway( {
			api: options.api,
			title: options.title,
			sectionId: options.sectionId,
			oldId: options.oldId,
			isNewPage: options.isNewPage
		} );
		this.readOnly = !!options.oldId; // If old revision, readOnly mode
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
		EditorOverlayBase.call( this, options );
	}

	OO.mfExtend( EditorOverlay, EditorOverlayBase, {
		/** @inheritdoc **/
		isBorderBox: false,
		/** @inheritdoc **/
		templatePartials: util.extend( {}, EditorOverlayBase.prototype.templatePartials, {
			content: mw.template.get( 'mobile.editor.overlay', 'content.hogan' ),
			messageBox: MessageBox.prototype.template,
			anonWarning: mw.template.get( 'mobile.editor.common', 'EditorOverlayAnonWarning.hogan' )
		} ),
		/**
		 * @inheritdoc
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {Object} defaults.loginButton options to render an sign in button
		 * @cfg {Object} defaults.signupButton options to render a sign up button
		 * @cfg {Object} defaults.anonButton options to render an edit anonymously button
		 * @cfg {Object} defaults.warningOptions options for a MessageBox to display anonymous message warning
		 * @cfg {mw.Api} defaults.api an api module to retrieve pages
		 */
		defaults: util.extend( {}, EditorOverlayBase.prototype.defaults, {
			ctaMessage: mw.msg( 'mobile-frontend-editor-anon-cta-message' ),
			loginButton: new Button( {
				block: true,
				label: mw.msg( 'mobile-frontend-watchlist-cta-button-login' )
			} ).options,
			signupButton: new Button( {
				block: true,
				label: mw.msg( 'mobile-frontend-watchlist-cta-button-signup' )
			} ).options,
			anonButton: new Button( {
				label: mw.msg( 'mobile-frontend-editor-anon' ),
				block: true,
				additionalClassNames: 'continue anonymous',
				progressive: true
			} ).options,
			warningOptions: {
				className: 'warningbox anon-msg',
				msg: mw.msg( 'mobile-frontend-editor-anonwarning' )
			}
		} ),
		editor: 'wikitext',
		sectionLine: '',

		/**
		 * Check whether VisualEditor is enabled or not.
		 * @method
		 * @return {boolean}
		 */
		isVisualEditorEnabled: function () {
			var ns = mw.config.get( 'wgVisualEditorConfig' ) &&
				mw.config.get( 'wgVisualEditorConfig' ).namespaces;

			return ns &&
				ns.indexOf(
					mw.config.get( 'wgNamespaceNumber' )
				) > -1 &&
				mw.config.get( 'wgTranslatePageTranslation' ) !== 'translation' &&
				mw.config.get( 'wgPageContentModel' ) === 'wikitext';
		},
		events: util.extend( {}, EditorOverlayBase.prototype.events, {
			'input .wikitext-editor': 'onInputWikitextEditor'
		} ),
		/**
		 * Wikitext Editor input handler
		 */
		onInputWikitextEditor: function () {
			this.gateway.setContent( this.$( '.wikitext-editor' ).val() );
			this.$( '.continue, .submit' ).prop( 'disabled', false );
		},
		/**
		 * @inheritdoc
		 */
		onClickContinue: function ( ev ) {
			// handle the click on "Edit without logging in"
			if ( this.options.isAnon && this.$( ev.target ).hasClass( 'anonymous' ) ) {
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
		postRender: function () {
			var self = this;

			if ( this.isVisualEditorEnabled() ) {
				mw.loader.using( 'ext.visualEditor.switching' ).then( function () {
					var switchToolbar,
						toolFactory = new OO.ui.ToolFactory(),
						toolGroupFactory = new OO.ui.ToolGroupFactory();

					toolFactory.register( mw.libs.ve.MWEditModeVisualTool );
					toolFactory.register( mw.libs.ve.MWEditModeSourceTool );
					switchToolbar = new OO.ui.Toolbar( toolFactory, toolGroupFactory, {
						classes: [ 'editor-switcher' ]
					} );

					switchToolbar.on( 'switchEditor', function ( mode ) {
						if ( mode === 'visual' ) {
							// If the user tries to switch to the VisualEditor, check if any changes have
							// been made, and if so, tell the user they have to save first.
							if ( !self.gateway.hasChanged ) {
								self._switchToVisualEditor( self.options );
							} else {
								// TODO: Replace with an OOUI dialog
								// eslint-disable-next-line no-alert
								if ( window.confirm( mw.msg( 'mobile-frontend-editor-switch-confirm' ) ) ) {
									self.onStageChanges();
								}
							}
						}
					} );

					switchToolbar.setup( [
						{
							type: 'list',
							icon: 'edit',
							title: mw.msg( 'visualeditor-mweditmode-tooltip' ), // resource-modules-disable-line
							include: [ 'editModeVisual', 'editModeSource' ]
						}
					] );

					self.$el.find( '.switcher-container' ).html( switchToolbar.$element );
					switchToolbar.emit( 'updateState' );
				} );
			}

			EditorOverlayBase.prototype.postRender.apply( this );

			this.$preview = this.$( '.preview' );
			this.$content = this.$( '.wikitext-editor' );
			this.$content.addClass( 'mw-editfont-' + mw.user.options.get( 'editfont' ) );
			if ( self.options.isAnon ) {
				this.$anonWarning = this.$( '.anonwarning' );
				this.$content.hide();
				// the user has to click login, signup or edit without login, disable "Next" button on top right
				this.$anonHiddenButtons = this.$( '.overlay-header .continue, .editor-switcher' ).hide();
				this.clearSpinner();
			}
			// make license links open in separate tabs
			this.$( '.license a' ).attr( 'target', '_blank' );

			this.abuseFilterPanel = new AbuseFilterPanel( {
				overlayManager: this.overlayManager
			} ).appendTo( this.$( '.panels' ) );

			// If in readOnly mode, make textarea readonly
			if ( this.readOnly ) {
				this.$content.prop( 'readonly', true );
			}

			this.$content.on( 'input', this._resizeEditor.bind( this ) );

			if ( !self.options.isAnon ) {
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
			var params = util.extend( {
				// use wgPageName as this includes the namespace if outside Main
					returnto: options.returnTo || mw.config.get( 'wgPageName' ),
					returntoquery: 'action=edit&section=' + options.sectionId,
					warning: 'mobile-frontend-edit-login-action'
				}, options.queryParams ),
				signupParams = util.extend( {
					type: 'signup',
					warning: 'mobile-frontend-edit-signup-action'
				}, options.signupQueryParams );

			options.loginButton = util.extend( {
				href: mw.util.getUrl( 'Special:UserLogin', params )
			}, this.defaults.loginButton );
			options.signupButton = util.extend( {
				href: mw.util.getUrl( 'Special:UserLogin', util.extend( params, signupParams ) )
			}, this.defaults.signupButton );

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

			this.scrollTop = util.getDocument().find( 'body' ).scrollTop();
			this.$content.hide();
			this.showSpinner();

			if ( mw.config.get( 'wgIsMainPage' ) ) {
				params.mainpage = 1; // Setting it to 0 will have the same effect
			}
			this.gateway.getPreview( params ).done( function ( result ) {
				var parsedText = result.text,
					parsedSectionLine = result.line;

				// On desktop edit summaries strip tags. Mimic this behavior on mobile devices
				self.sectionLine = self.parseHTML( '<div>' ).html( parsedSectionLine ).text();
				new Section( {
					el: self.$preview,
					text: parsedText
				} ).$( 'a' ).on( 'click', false );
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
			this.gateway.abortPreview();
			this.clearSpinner();
			this.$preview.removeClass( 'error' ).hide();
			this.$content.show();
			window.scrollTo( 0, this.scrollTop );
			this.showHidden( '.initial-header' );
			this.abuseFilterPanel.hide();
		},

		/**
		 * Resize the editor textarea, maintaining scroll position in iOS
		 */
		_resizeEditor: function () {
			var scrollTop, container, $scrollContainer;

			if ( !this.$scrollContainer ) {
				container = OO.ui.Element.static.getClosestScrollableContainer( this.$content[ 0 ] );
				// The scroll container will be either within the view or the document element itself.
				$scrollContainer = this.$( container ).length ? this.$( container ) : util.getDocument();
				this.$scrollContainer = $scrollContainer;
				this.$content.css( 'padding-bottom', this.$scrollContainer.height() * 0.6 );
			} else {
				$scrollContainer = this.$scrollContainer;
			}

			// Only do this if scroll container exists
			if ( this.$content.prop( 'scrollHeight' ) && $scrollContainer.length ) {
				scrollTop = $scrollContainer.scrollTop();
				this.$content
					.css( 'height', 'auto' )
					// can't reuse prop( 'scrollHeight' ) because we need the current value
					.css( 'height', ( this.$content.prop( 'scrollHeight' ) + 2 ) + 'px' );
				$scrollContainer.scrollTop( scrollTop );
			}
		},

		/**
		 * Set content to the user input field.
		 * @param {string} content The content to set.
		 */
		setContent: function ( content ) {
			this.$content
				.show()
				.val( content );
			this._resizeEditor();
		},

		/**
		 * Returns the content of the user input field.
		 * @return {string}
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

			this.gateway.getContent()
				.done( function ( result ) {
					var parser, ast, parsedBlockReason,
						content = result.text,
						userinfo = result.user,
						block = result.block,
						userTalkPage = mw.config.get( 'wgNamespaceNumber' ) === 3;

					self.setContent( content );
					// check if user is blocked
					if ( userinfo && userinfo.hasOwnProperty( 'blockid' ) &&
						!( userTalkPage && block.allowusertalk ) ) {
						// Workaround to parse a message parameter for mw.message, see T96885
						// eslint-disable-next-line new-cap
						parser = new mw.jqueryMsg.parser();
						ast = parser.wikiTextToAst( userinfo.blockreason );
						parsedBlockReason = parser.emitter.emit( ast );
						toast.show(
							mw.message(
								'mobile-frontend-editor-blocked-info',
								userinfo.blockedby,
								parsedBlockReason
							).parse()
						);
						self.hide();
					}
					self.clearSpinner();
				} )
				.fail( function () {
					self.reportError( mw.msg( 'mobile-frontend-editor-error-loading' ) );
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
			this.log( {
				action: 'abort',
				type: 'switchnochange',
				mechanism: 'navigate'
			} );
			// Save a user setting indicating that this user prefers using the VisualEditor
			mw.storage.set( 'preferredEditor', 'VisualEditor' );
			// Load the VisualEditor and replace the SourceEditor overlay with it
			this.showSpinner();
			this.$content.hide();
			mw.loader.using(
				'mobile.editor.ve',
				function () {
					var VisualEditorOverlay = M.require( 'mobile.editor.ve/VisualEditorOverlay' );

					self.clearSpinner();
					self.overlayManager.replaceCurrent( new VisualEditorOverlay( options ) );
				},
				function () {
					self.clearSpinner();
					self.$content.show();
					// FIXME: We should show an error notification, but right now toast
					// notifications are not dismissible when shown within the editor.
				}
			);
		},

		/**
		 * Reveals an abuse filter panel inside the view.
		 * @method
		 * @private
		 * @param {string} type The type of alert, e.g. 'warning' or 'disallow'
		 * @param {string} message Message to show in the AbuseFilter overlay
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

			this.gateway.save( options )
				.done( function () {
					var title = self.options.title;
					// Special case behaviour of main page
					if ( mw.config.get( 'wgIsMainPage' ) ) {
						// FIXME: Blocked on T189173
						// eslint-disable-next-line no-restricted-properties
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
						],
						key = response && response.error && response.error.code,
						typeMap = {
							editconflict: 'editConflict',
							wasdeleted: 'editPageDeleted',
							'abusefilter-disallowed': 'extensionAbuseFilter',
							captcha: 'extensionCaptcha',
							spamprotectiontext: 'extensionSpamBlacklist',
							'titleblacklist-forbidden-edit': 'extensionTitleBlacklist'
						};

					if ( data.type === 'captcha' ) {
						self.captchaId = data.details.id;
						self.handleCaptcha( data.details );
						key = 'captcha';
					} else if ( data.type === 'abusefilter' ) {
						self._showAbuseFilter( data.details.type, data.details.message );
					} else {
						if ( key === 'editconflict' ) {
							msg = mw.msg( 'mobile-frontend-editor-error-conflict' );
						} else if ( whitelistedErrorInfo.indexOf( key ) > -1 ) {
							msg = response.error.info;
						} else {
							msg = mw.msg( 'mobile-frontend-editor-error' );
						}

						self.reportError( msg );
						self.showHidden( '.save-header, .save-panel' );
					}

					self.log( {
						action: 'saveFailure',
						message: msg,
						type: typeMap[key] || 'responseUnknown'
					} );
				} );
		},

		/**
		 * Checks whether the existing content has changed.
		 * @method
		 * @return {boolean}
		 */
		hasChanged: function () {
			return this.gateway.hasChanged;
		}
	} );

	M.define( 'mobile.editor.overlay/EditorOverlay', EditorOverlay );
}( mw.mobileFrontend ) );
