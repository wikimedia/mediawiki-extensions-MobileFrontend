( function ( M, $ ) {
	var Overlay = M.require( 'Overlay' ),
		browser = M.require( 'browser' ),
		schema = M.require( 'loggingSchemas/mobileWebEditing' ),
		Icon = M.require( 'Icon' ),
		toast = M.require( 'toast' ),
		user = M.require( 'user' ),
		settings = M.require( 'settings' ),
		EditorOverlayBase;

	/**
	 * Base class for EditorOverlay
	 * @extends Overlay
	 * @class EditorOverlayBase
	 * @uses Icon
	 * @uses user
	 */
	EditorOverlayBase = Overlay.extend( {
		/**
		 * @inheritdoc
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {Boolean} defaults.hasToolbar Whether the editor has a toolbar or not. When
		 *  disabled a header will be show instead.
		 * @cfg {String} defaults.switcherButton HTML of the editor switcher button.
		 * @cfg {String} defaults.sourceButton HTML of the button that shows the page source.
		 * @cfg {String} defaults.veButton HTML of the button that opens the Visual Editor.
		 * @cfg {String} defaults.continueMsg Caption for the next button on edit form which takes
		 * you to the screen that shows a preview and license information.
		 * @cfg {String} defaults.cancelMsg Caption for cancel button on edit form.
		 * @cfg {String} defaults.closeMsg Caption for a button that takes you back to editing
		 * from edit preview screen.
		 * @cfg {String} defaults.summaryRequestMsg Header above edit summary input field asking
		 * the user to summarize the changes they made to the page.
		 * @cfg {String} defaults.summaryMsg A placeholder with examples for the summary input
		 * field asking user what they changed.
		 * @cfg {String} defaults.placeholder Placeholder text for empty sections.
		 * @cfg {String} defaults.waitMsg Text that displays while a page edit is being saved.
		 * @cfg {String} defaults.waitIcon HTML of the icon that displays while a page edit
		 * is being saved.
		 * @cfg {String} defaults.captchaMsg Placeholder for captcha input field.
		 * @cfg {String} defaults.captchaTryAgainMsg A message shown when user enters wrong CAPTCHA
		 * and a new one is displayed.
		 * @cfg {String} defaults.switchMsg Label for button that allows the user to switch between
		 * two different editing interfaces.
		 */
		defaults: $.extend( {}, Overlay.prototype.defaults, {
			hasToolbar: false,
			switcherButton: new Icon( {
				tagName: 'button',
				name: 'edit-switch',
				// Label required to prevent height rendering bug
				label: '\u00a0',
				additionalClassNames: 'editor-switcher'
			} ).toHtmlString(),
			sourceButton: new Icon( {
				name: 'edit-source',
				additionalClassNames: 'icon-32px editor-choice',
				hasText: true,
				label: mw.msg( 'mobile-frontend-editor-source-editor' )
			} ).toHtmlString(),
			veButton: new Icon( {
				name: 'edit-ve',
				additionalClassNames: 'icon-32px editor-choice',
				hasText: true,
				label: mw.msg( 'mobile-frontend-editor-visual-editor' )
			} ).toHtmlString(),
			continueMsg: mw.msg( 'mobile-frontend-editor-continue' ),
			cancelMsg: mw.msg( 'mobile-frontend-editor-cancel' ),
			closeMsg: mw.msg( 'mobile-frontend-editor-keep-editing' ),
			summaryRequestMsg: mw.msg( 'mobile-frontend-editor-summary-request' ),
			summaryMsg: mw.msg( 'mobile-frontend-editor-summary-placeholder' ),
			placeholder: mw.msg( 'mobile-frontend-editor-placeholder' ),
			waitMsg: mw.msg( 'mobile-frontend-editor-wait' ),
			// icons.spinner can't be used, the spinner class changes to display:none in onStageChanges
			waitIcon: new Icon( {
				tagName: 'button',
				name: 'spinner',
				additionalClassNames: 'savespinner loading'
			} ).toHtmlString(),
			captchaMsg: mw.msg( 'mobile-frontend-account-create-captcha-placeholder' ),
			captchaTryAgainMsg: mw.msg( 'mobile-frontend-editor-captcha-try-again' ),
			switchMsg: mw.msg( 'mobile-frontend-editor-switch-editor' )
		} ),
		/** @inheritdoc **/
		templatePartials: {
			switcher: mw.template.get( 'mobile.editor.common', 'switcher.hogan' ),
			editHeader: mw.template.get( 'mobile.editor.common', 'editHeader.hogan' ),
			previewHeader: mw.template.get( 'mobile.editor.common', 'previewHeader.hogan' ),
			saveHeader: mw.template.get( 'mobile.editor.common', 'saveHeader.hogan' )
		},
		/** @inheritdoc **/
		template: mw.template.get( 'mobile.editor.common', 'EditorOverlayBase.hogan' ),
		/** @inheritdoc **/
		className: 'overlay editor-overlay',
		/**
		 * Logs an event to  http://meta.wikimedia.org/wiki/Schema:MobileWebEditing
		 * @param {String} action name in workflow.
		 * @param {String} errorText error to report if applicable
		 */
		log: function ( action, errorText ) {
			var
				data = {
					action: action,
					section: this.sectionId,
					editor: this.editor,
					funnel: this.funnel
				};
			if ( errorText ) {
				data.errorText = errorText;
			}
			return schema.log( data );
		},
		/**
		 * Reveals a spinner at the top of the overlay.
		 * @method
		 */
		showSpinner: function () {
			this.$spinner.show();
		},
		/**
		 * Hides a spinner at the top of the overlay.
		 * @method
		 */
		clearSpinner: function () {
			this.$spinner.hide();
		},

		/**
		 * If this is a new article, require confirmation before saving.
		 * @method
		 */
		confirmSave: function () {
			if ( this.isNewPage &&
				!window.confirm( mw.msg( 'mobile-frontend-editor-new-page-confirm', mw.user ) )
			) {
				return false;
			} else {
				return true;
			}
		},
		/**
		 * Executed when page save is complete. Handles reloading the page, showing toast
		 * messages, and setting mobile edit cookie.
		 * @method
		 */
		onSaveComplete: function () {
			var msg,
				title = this.options.title,
				self = this;

			// FIXME: use generic method for following 3 lines
			M.pageApi.invalidatePage( title );

			if ( this.isNewPage ) {
				msg = 'mobile-frontend-editor-success-new-page';
			} else if ( this.isNewEditor ) {
				msg = 'mobile-frontend-editor-success-landmark-1';
			} else {
				msg = 'mobile-frontend-editor-success';
			}
			msg = mw.msg( msg );

			settings.save( 'mobile-pending-toast', msg );

			// Ensure we don't lose this event when logging
			this.log( 'success' ).always( function () {
				if ( self.sectionLine ) {
					title = title + '#' + self.sectionLine;
				}

				window.location = mw.util.getUrl( title );
			} );

			// Set a cookie for 30 days indicating that this user has edited from
			// the mobile interface.
			$.cookie( 'mobileEditor', 'true', {
				expires: 30
			} );
		},
		/** @inheritdoc **/
		initialize: function ( options ) {
			if ( options.isNewPage ) {
				options.placeholder = mw.msg( 'mobile-frontend-editor-placeholder-new-page', mw.user );
			}
			// change the message to request a summary when not in article namespace
			if ( mw.config.get( 'wgNamespaceNumber' ) !== 0 ) {
				options.summaryRequestMsg = mw.msg( 'mobile-frontend-editor-summary' );
			}
			if ( mw.config.get( 'wgMFLicenseLink' ) ) {
				// If terms of use is enabled, include it in the licensing message
				// FIXME: cache this selector, it's used at least twice
				if ( $( '#footer-places-terms-use' ).length > 0 ) {
					options.licenseMsg = mw.msg(
						'mobile-frontend-editor-licensing-with-terms',
						$( '#footer-places-terms-use' ).html(),
						mw.config.get( 'wgMFLicenseLink' )
					);
				} else {
					options.licenseMsg = mw.msg(
						'mobile-frontend-editor-licensing',
						mw.config.get( 'wgMFLicenseLink' )
					);
				}
			}
			this.editCount = user.getEditCount();
			this.isNewPage = options.isNewPage;
			this.isNewEditor = options.isNewEditor;
			this.sectionId = options.sectionId;
			this.funnel = options.funnel;

			Overlay.prototype.initialize.apply( this, arguments );
		},
		/**
		 * Report errors back to the user. Silently record the error using EventLogging.
		 * @method
		 * @param {String} msg key of message to display to user
		 * @param {String} errorText to log to EventLogging
		 */
		reportError: function ( msg, errorText ) {
			this.log( 'error', errorText );
			toast.show( msg, 'toast error' );
		},
		/**
		 * Prepares the penultimate screen before saving.
		 * Expects to be overridden by child class.
		 * @method
		 */
		onStageChanges: function () {
			// FIXME: Don't call a private method that is outside the class.
			this._showHidden( '.save-header, .save-panel' );
			this.log( 'save' );
			// Scroll to the top of the page, so that the summary input is visible
			// (even if overlay was scrolled down when editing) and weird iOS header
			// problems are avoided (header position not updating to the top of the
			// screen, instead staying lower until a subsequent scroll event).
			window.scrollTo( 0, 1 );
		},
		/**
		 * Executed when the editor clicks the save button. Expects to be overridden by child
		 * class. Checks if the save needs to be confirmed.
		 * @method
		 */
		onSaveBegin: function () {
			this.confirmAborted = false;
			// Ask for confirmation in some cases
			if ( !this.confirmSave() ) {
				this.confirmAborted = true;
				return;
			}
			this.log( 'submit' );
		},
		/** @inheritdoc **/
		postRender: function () {
			var self = this;
			// Add a class so editor can make some Android 2 specific customisations.
			if ( browser.isAndroid2() ) {
				this.$el.addClass( 'android-2' );
			}
			this.$spinner = self.$( '.spinner' );
			// log edit attempt
			this.log( 'attempt' );

			// FIXME: This should be .close (see bug 71203)
			this.$( '.back' ).eq( 0 ).on( 'click', function () {
				// log cancel attempt
				self.log( 'cancel' );
			} );
			Overlay.prototype.postRender.apply( this, arguments );
			// FIXME: Don't call a private method that is outside the class.
			this._showHidden( '.initial-header' );
			this.$( '.submit' ).on( 'click', $.proxy( this, 'onSaveBegin' ) );
			this.$( '.continue' ).on( 'click', $.proxy( this, 'onStageChanges' ) );
		},
		/**
		 * Set up the editor switching interface
		 * The actual behavior of the editor buttons is initialized in postRender()
		 * @method
		 */
		initializeSwitcher: function () {
			this.$( '.editor-switcher' ).on( 'click', function ( ev ) {
				var $self = $( this );
				ev.preventDefault();
				// Prevent double toggling
				ev.stopPropagation();
				// Exit early if switcher is disabled
				if ( $self.hasClass( 'disabled' ) ) {
					return false;
				}
				$self.toggleClass( 'selected' );
				$( '.switcher-drop-down' ).toggle();
				// If you click outside the drop-down, hide the drop-down
				$( document ).one( 'click', function () {
					$( '.switcher-drop-down' ).hide();
					$self.removeClass( 'selected' );
				} );
			} );
		},
		/**
		 * Allow prompts user to confirm before closing and losing edit.
		 * @inheritdoc
		 */
		hide: function ( force ) {
			var confirmMessage = mw.msg( 'mobile-frontend-editor-cancel-confirm' );
			if ( force || !this.hasChanged() || window.confirm( confirmMessage ) ) {
				return Overlay.prototype.hide.apply( this, arguments );
			} else {
				return false;
			}
		},
		/**
		 * Checks whether the state of the thing being edited as changed. Expects to be
		 * implemented by child class.
		 * @method
		 */
		hasChanged: $.noop(),
		/**
		 * Reveal the captcha in the View
		 * @method
		 * @private
		 * @param {String} url a url to an image representing the current captcha.
		 */
		_showCaptcha: function ( url ) {
			var self = this,
				$input = this.$( '.captcha-word' );

			if ( this.captchaShown ) {
				$input.val( '' );
				$input.attr( 'placeholder', this.options.captchaTryAgainMsg );
				setTimeout( function () {
					$input.attr( 'placeholder', self.options.captchaMsg );
				}, 2000 );
			}

			this.$( '.captcha-panel img' ).attr( 'src', url );
			// FIXME: Don't call a private method that is outside the class.
			this._showHidden( '.save-header, .captcha-panel' );

			this.captchaShown = true;
		}
	} );

	M.define( 'modules/editor/EditorOverlayBase', EditorOverlayBase );
}( mw.mobileFrontend, jQuery ) );
