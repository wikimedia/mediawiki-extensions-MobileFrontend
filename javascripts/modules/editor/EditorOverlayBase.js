( function ( M, $ ) {
	var Overlay = M.require( 'Overlay' ),
		browser = M.require( 'browser' ),
		SchemaMobileWebEditing = M.require( 'loggingSchemas/SchemaMobileWebEditing' ),
		Icon = M.require( 'Icon' ),
		toast = M.require( 'toast' ),
		user = M.require( 'user' ),
		settings = M.require( 'settings' ),
		pageApi = M.require( 'pageApi' ),
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
			continueMsg: mw.msg( 'mobile-frontend-editor-continue' ),
			cancelMsg: mw.msg( 'mobile-frontend-editor-cancel' ),
			closeMsg: mw.msg( 'mobile-frontend-editor-keep-editing' ),
			summaryRequestMsg: mw.msg( 'mobile-frontend-editor-summary-request' ),
			summaryMsg: mw.msg( 'mobile-frontend-editor-summary-placeholder' ),
			placeholder: mw.msg( 'mobile-frontend-editor-placeholder' ),
			waitMsg: mw.msg( 'mobile-frontend-editor-wait' ),
			// icons.spinner can't be used, the spinner class changes to display:none in onStageChanges
			waitIcon: new Icon( {
				name: 'spinner',
				additionalClassNames: 'savespinner loading'
			} ).toHtmlString(),
			captchaMsg: mw.msg( 'mobile-frontend-account-create-captcha-placeholder' ),
			captchaTryAgainMsg: mw.msg( 'mobile-frontend-editor-captcha-try-again' ),
			switchMsg: mw.msg( 'mobile-frontend-editor-switch-editor' ),
			confirmMsg: mw.msg( 'mobile-frontend-editor-cancel-confirm' )
		} ),
		/** @inheritdoc **/
		templatePartials: {
			editHeader: mw.template.get( 'mobile.editor.common', 'editHeader.hogan' ),
			previewHeader: mw.template.get( 'mobile.editor.common', 'previewHeader.hogan' ),
			saveHeader: mw.template.get( 'mobile.editor.common', 'saveHeader.hogan' )
		},
		/** @inheritdoc **/
		template: mw.template.get( 'mobile.editor.common', 'EditorOverlayBase.hogan' ),
		/** @inheritdoc **/
		className: 'overlay editor-overlay',
		events: $.extend( {}, Overlay.prototype.events, {
			// FIXME: This should be .close (see bug 71203)
			'click .back': 'onClickBack',
			'click .continue': 'onClickContinue',
			'click .submit': 'onClickSubmit'
		} ),

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
			return this.schema.log( data );
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
			pageApi.invalidatePage( title );

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

				$( window ).off( 'beforeunload.mfeditorwarning' );
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
						mw.message(
							'mobile-frontend-editor-terms-link',
							$( '#footer-places-terms-use a' ).attr( 'href' )
						).parse(),
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
			this.schema = new SchemaMobileWebEditing();
			this.config = mw.config.get( 'wgMFEditorOptions' );
			$( window ).on( 'beforeunload.mfeditorwarning', $.proxy( this, 'onBeforeUnload' ) );

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
			this.showHidden( '.save-header, .save-panel' );
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
			// Add a class so editor can make some Android 2 specific customisations.
			if ( browser.isAndroid2() ) {
				this.$el.addClass( 'android-2' );
			}
			// log edit attempt
			this.log( 'attempt' );

			// decide what happens, when the user clicks the continue button
			if ( this.config.skipPreview ) {
				// skip the preview and save the changes
				this.nextStep = 'onSaveBegin';
				this.$( '.continue' ).text( this.defaults.saveMsg );
			} else {
				// default: show the preview step
				this.nextStep = 'onStageChanges';
			}
			Overlay.prototype.postRender.apply( this, arguments );
			this.showHidden( '.initial-header' );
		},
		/**
		 * Back button click handler
		 */
		onClickBack: function () {
			// log cancel attempt
			this.log( 'cancel' );
		},
		/**
		 * Submit button click handler
		 */
		onClickSubmit: function () {
			this.onSaveBegin();
		},
		/**
		 * Continue button click handler
		 */
		onClickContinue: function () {
			this[this.nextStep]();
		},
		/**
		 * beforeunload event handler
		 */
		onBeforeUnload: function () {
			if ( this.shouldConfirmLeave( false ) ) {
				return this.defaults.confirmMsg;
			}
		},
		/**
		 * Set up the editor switching interface
		 * The actual behavior of the editor buttons is initialized in postRender()
		 * @method
		 */
		initializeSwitcher: function () {
			var toolFactory = new OO.ui.ToolFactory(),
				toolGroupFactory = new OO.ui.ToolGroupFactory(),
				toolbar;

			/**
			 * 'Edit' button
			 * @param {OO.ui.ToolGroup} toolGroup
			 * @param {Object} config
			 * @constructor
			 */
			function EditVeTool( toolGroup, config ) {
				config = config || {};
				config.classes = [ 'visual-editor' ];
				EditVeTool.super.call( this, toolGroup, config );
			}
			OO.inheritClass( EditVeTool, OO.ui.Tool );

			EditVeTool.static.name = 'editVe';
			EditVeTool.static.icon = 'edit-ve';
			EditVeTool.static.group = 'editorSwitcher';
			EditVeTool.static.title = mw.msg( 'mobile-frontend-editor-visual-editor' );
			/**
			 * click handler
			 */
			EditVeTool.prototype.onSelect = function () {
				// will be overridden later
			};

			/**
			 * 'Edit source' button
			 * @param {OO.ui.ToolGroup} toolGroup
			 * @param {Object} config
			 * @constructor
			 */
			function EditSourceTool( toolGroup, config ) {
				config = config || {};
				config.classes = [ 'source-editor' ];
				EditSourceTool.super.call( this, toolGroup, config );
			}

			OO.inheritClass( EditSourceTool, OO.ui.Tool );

			EditSourceTool.static.name = 'editSource';
			EditSourceTool.static.icon = 'edit-source';
			EditSourceTool.static.group = 'editorSwitcher';
			EditSourceTool.static.title = mw.msg( 'mobile-frontend-editor-source-editor' );
			/**
			 * click handler
			 */
			EditSourceTool.prototype.onSelect = function () {
				// will be overridden later
			};

			toolbar = new OO.ui.Toolbar( toolFactory, toolGroupFactory, {
				classes: [ 'editor-switcher' ]
			} );
			toolFactory.register( EditVeTool );
			toolFactory.register( EditSourceTool );

			toolbar.setup( [
				{
					icon: 'editor-switcher',
					type: 'list',
					include: [ {
						group: 'editorSwitcher'
					} ]
				}
			] );

			this.$el.find( '.switcher-container' ).html( toolbar.$element );
			this.switcherToolbar = toolbar;
		},
		/**
		 * Allow prompts user to confirm before closing and losing edit.
		 * @inheritdoc
		 */
		hide: function ( force ) {
			if ( !this.shouldConfirmLeave( force ) || window.confirm( this.defaults.confirmMsg ) ) {
				// turn off beforeunload event handler
				$( window ).off( 'beforeunload.mfeditorwarning' );
				return Overlay.prototype.hide.apply( this, arguments );
			} else {
				return false;
			}
		},
		/**
		 * Check, if the user should be asked if they really want to leave the page.
		 * Returns false, if he hasn't made changes, otherwise true.
		 * @param {Boolean} [force] Whether this function should always return false
		 * @return {Boolean}
		 */
		shouldConfirmLeave: function ( force ) {
			if ( force || !this.hasChanged() ) {
				return false;
			}
			return true;

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
			this.showHidden( '.save-header, .captcha-panel' );

			this.captchaShown = true;
		}
	} );

	M.define( 'modules/editor/EditorOverlayBase', EditorOverlayBase );
}( mw.mobileFrontend, jQuery ) );
