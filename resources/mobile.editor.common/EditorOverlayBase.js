( function ( M ) {
	var Overlay = M.require( 'mobile.startup/Overlay' ),
		util = M.require( 'mobile.startup/util' ),
		PageGateway = M.require( 'mobile.startup/PageGateway' ),
		Icon = M.require( 'mobile.startup/Icon' ),
		toast = M.require( 'mobile.startup/toast' ),
		user = M.require( 'mobile.startup/user' ),
		mwUser = mw.user;

	/**
	 * 'Edit' button
	 * @param {OO.ui.ToolGroup} toolGroup
	 * @param {Object} config
	 * @ignore
	 */
	function EditVeTool( toolGroup, config ) {
		config = config || {};
		config.classes = [ 'visual-editor' ];
		EditVeTool.super.call( this, toolGroup, config );
	}
	OO.inheritClass( EditVeTool, OO.ui.Tool );

	EditVeTool.static.name = 'editVe';
	EditVeTool.static.icon = 'edit';
	EditVeTool.static.group = 'editorSwitcher';
	EditVeTool.static.title = mw.msg( 'mobile-frontend-editor-switch-visual-editor' );
	/**
	 * click handler
	 */
	EditVeTool.prototype.onSelect = function () {
		// will be overridden later
	};
	/**
	 * Toolbar update state handler.
	 */
	EditVeTool.prototype.onUpdateState = function () {
		// do nothing
	};

	/**
	 * Base class for EditorOverlay
	 * @class EditorOverlayBase
	 * @extends Overlay
	 * @uses Icon
	 * @uses user
	 * @param {Object} options Configuration options
	 */
	function EditorOverlayBase( options ) {
		var self = this;

		if ( options.isNewPage ) {
			options.placeholder = mw.msg( 'mobile-frontend-editor-placeholder-new-page', mwUser );
		}
		// change the message to request a summary when not in article namespace
		if ( mw.config.get( 'wgNamespaceNumber' ) !== 0 ) {
			options.summaryRequestMsg = mw.msg( 'mobile-frontend-editor-summary' );
		}
		this.pageGateway = new PageGateway( options.api );
		this.editCount = user.getEditCount();
		this.isNewPage = options.isNewPage;
		this.isNewEditor = options.isNewEditor;
		this.sectionId = options.sectionId;
		this.config = mw.config.get( 'wgMFEditorOptions' );
		this.sessionId = options.sessionId;
		this.overlayManager = options.overlayManager;
		this.allowCloseWindow = mw.confirmCloseWindow( {
			// Returns true if content has changed
			test: function () {
				// Check if content has changed
				return self.hasChanged();
			},

			// Message to show the user, if content has changed
			message: mw.msg( 'mobile-frontend-editor-cancel-confirm' ),
			// Event namespace
			namespace: 'editwarning'
		} );

		Overlay.apply( this, arguments );
	}

	OO.mfExtend( EditorOverlayBase, Overlay, {
		/**
		 * @inheritdoc
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {OverlayManager} defaults.overlayManager instance
		 * @cfg {mw.Api} defaults.api to interact with
		 * @cfg {boolean} defaults.hasToolbar Whether the editor has a toolbar or not. When
		 *  disabled a header will be show instead.
		 * @cfg {string} defaults.continueMsg Caption for the next button on edit form which takes
		 * you to the screen that shows a preview and license information.
		 * @cfg {string} defaults.cancelMsg Caption for cancel button on edit form.
		 * @cfg {string} defaults.closeMsg Caption for a button that takes you back to editing
		 * from edit preview screen.
		 * @cfg {string} defaults.summaryRequestMsg Header above edit summary input field asking
		 * the user to summarize the changes they made to the page.
		 * @cfg {string} defaults.summaryMsg A placeholder with examples for the summary input
		 * field asking user what they changed.
		 * @cfg {string} defaults.placeholder Placeholder text for empty sections.
		 * @cfg {string} defaults.waitMsg Text that displays while a page edit is being saved.
		 * @cfg {string} defaults.waitIcon HTML of the icon that displays while a page edit
		 * is being saved.
		 * @cfg {string} defaults.captchaMsg Placeholder for captcha input field.
		 * @cfg {string} defaults.captchaTryAgainMsg A message shown when user enters wrong CAPTCHA
		 * and a new one is displayed.
		 * @cfg {string} defaults.switchMsg Label for button that allows the user to switch between
		 * two different editing interfaces.
		 * @cfg {string} defaults.licenseMsg Text and link of the license, under which this contribution will be
		 * released to inform the user.
		 */
		defaults: util.extend( {}, Overlay.prototype.defaults, {
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
			confirmMsg: mw.msg( 'mobile-frontend-editor-cancel-confirm' ),
			licenseMsg: undefined
		} ),
		/** @inheritdoc **/
		templatePartials: util.extend( {}, Overlay.prototype.templatePartials, {
			editHeader: mw.template.get( 'mobile.editor.common', 'editHeader.hogan' ),
			previewHeader: mw.template.get( 'mobile.editor.common', 'previewHeader.hogan' ),
			saveHeader: mw.template.get( 'mobile.editor.common', 'saveHeader.hogan' )
		} ),
		/** @inheritdoc **/
		template: mw.template.get( 'mobile.editor.common', 'EditorOverlayBase.hogan' ),
		/** @inheritdoc **/
		className: 'overlay editor-overlay',
		events: util.extend( {}, Overlay.prototype.events, {
			'click .back': 'onClickBack',
			'click .continue': 'onClickContinue',
			'click .submit': 'onClickSubmit'
		} ),
		/**
		 * Logs an event to  http://meta.wikimedia.org/wiki/Schema:Edit
		 * @param {Object} data
		 */
		log: function ( data ) {
			mw.track( 'mf.schemaEdit', util.extend( data, {
				editor: this.editor,
				editingSessionId: this.sessionId
			} ) );
		},

		/**
		 * If this is a new article, require confirmation before saving.
		 * @method
		 * @return {boolean} The user confirmed saving
		 */
		confirmSave: function () {
			if ( this.isNewPage &&
				// TODO: Replace with an OOUI dialog
				// eslint-disable-next-line no-alert
				!window.confirm( mw.msg( 'mobile-frontend-editor-new-page-confirm', mwUser ) )
			) {
				return false;
			} else {
				return true;
			}
		},
		/**
		 * Executed when page save is complete. Handles reloading the page, showing toast
		 * messages.
		 * @method
		 */
		onSaveComplete: function () {
			var msg,
				$window = util.getWindow(),
				title = this.options.title,
				self = this;

			// FIXME: use generic method for following 3 lines
			this.pageGateway.invalidatePage( title );
			// Close the overlay to cancel the hash fragment
			// otherwise clicking back will take you back to the editor.
			self.hide();

			if ( this.isNewPage ) {
				msg = mw.msg( 'mobile-frontend-editor-success-new-page' );
			} else if ( this.isNewEditor ) {
				msg = mw.msg( 'mobile-frontend-editor-success-landmark-1' );
			} else {
				msg = mw.msg( 'mobile-frontend-editor-success' );
			}
			toast.showOnPageReload( msg, 'success' );

			// Ensure we don't lose this event when logging
			this.log( {
				action: 'saveSuccess'
			} );
			if ( self.sectionLine ) {
				title = title + '#' + self.sectionLine;
			}

			$window.off( 'beforeunload.mfeditorwarning' );

			// FIXME: Blocked on T189173
			// eslint-disable-next-line no-restricted-properties
			window.location = mw.util.getUrl( title );
			if ( self.sectionLine ) {
				// since the path and only the hash has changed it has not triggered a refresh so forcefully refresh
				// FIXME: Blocked on T189173
				// eslint-disable-next-line no-restricted-properties
				window.location.reload();
			}
		},
		/**
		 * Report load errors back to the user. Silently record the error using EventLogging.
		 * @method
		 * @param {string} text Text of message to display to user
		 */
		reportError: function ( text ) {
			toast.show( text, 'error' );
		},
		/**
		 * Prepares the penultimate screen before saving.
		 * Expects to be overridden by child class.
		 * @method
		 */
		onStageChanges: function () {
			this.showHidden( '.save-header, .save-panel' );
			this.log( {
				action: 'saveIntent'
			} );
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
			this.log( {
				action: 'saveAttempt'
			} );
		},
		/** @inheritdoc **/
		postRender: function () {
			// log edit attempt
			this.log( {
				action: 'ready'
			} );

			// decide what happens, when the user clicks the continue button
			if ( this.config.skipPreview ) {
				// skip the preview and save the changes
				this.nextStep = 'onSaveBegin';
				this.$( '.continue' ).text( this.defaults.saveMsg );
			} else {
				// default: show the preview step
				this.nextStep = 'onStageChanges';
			}
			Overlay.prototype.postRender.apply( this );
			this.showHidden( '.initial-header' );
		},
		/**
		 * Back button click handler
		 * @method
		 */
		onClickBack: util.noop,
		/**
		 * Exit handler
		 */
		onExitClick: function () {
			Overlay.prototype.onExitClick.apply( this, arguments );
			// log cancel attempt
			this.log( {
				action: 'abort',
				mechanism: 'cancel',
				type: this.hasChanged() ? 'abandon' : 'nochange'
			} );
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
		 * @inheritdoc
		 */
		hide: function () {
			var self = this;
			if ( this.hasChanged() ) {
				OO.ui.confirm( mw.msg( 'mobile-frontend-editor-cancel-confirm' ) ).done( function ( confirmed ) {
					if ( confirmed ) {
						self.allowCloseWindow.release();
						Overlay.prototype.hide.call( self );
					}
				} );
			} else {
				this.allowCloseWindow.release();
				return Overlay.prototype.hide.call( self );
			}
		},
		/**
		 * Check, if the user should be asked if they really want to leave the page.
		 * Returns false, if he hasn't made changes, otherwise true.
		 * @param {boolean} [force] Whether this function should always return false
		 * @return {boolean}
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
		hasChanged: util.noop,
		/**
		 * Handles a failed save due to a CAPTCHA provided by ConfirmEdit extension.
		 * @method
		 * @param {Object} details Details returned from the api.
		 */
		handleCaptcha: function ( details ) {
			var self = this,
				$input = this.$( '.captcha-word' );

			if ( this.captchaShown ) {
				$input.val( '' );
				$input.attr( 'placeholder', this.options.captchaTryAgainMsg );
				setTimeout( function () {
					$input.attr( 'placeholder', self.options.captchaMsg );
				}, 2000 );
			}

			// handle different mime types different
			if ( details.mime.indexOf( 'image/' ) === 0 ) {
				// image based CAPTCHA's like provided by FancyCaptcha, ReCaptcha or similar
				this.$( '.captcha-panel#question' ).detach();
				this.$( '.captcha-panel img' ).attr( 'src', details.url );
			} else {
				// not image based CAPTCHA.
				this.$( '.captcha-panel #image' ).detach();
				if ( details.mime.indexOf( 'text/html' ) === 0 ) {
					// handle mime type of HTML as HTML content (display as-is).
					// QuestyCaptcha now have default MIME type "text/html": see T147606
					this.$( '.captcha-panel #question' ).html( details.question );
				} else {
					// handle mime types (other than image based ones and HTML based ones) as plain text by default.
					// e.g. MathCaptcha (solve a math formula) or
					// SimpleCaptcha (simple math formula)
					this.$( '.captcha-panel #question' ).text( details.question );
				}
			}

			this.showHidden( '.save-header, .captcha-panel' );
			this.captchaShown = true;
		}
	} );

	M.define( 'mobile.editor.common/EditorOverlayBase', EditorOverlayBase )
		.deprecate( 'modules/editor/EditorOverlayBase' );
}( mw.mobileFrontend ) );
