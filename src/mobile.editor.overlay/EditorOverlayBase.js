var Overlay = require( '../mobile.startup/Overlay' ),
	util = require( '../mobile.startup/util' ),
	PageGateway = require( '../mobile.startup/PageGateway' ),
	Icon = require( '../mobile.startup/Icon' ),
	toast = require( '../mobile.startup/toast' ),
	saveFailureMessage = require( './saveFailureMessage' ),
	mfExtend = require( '../mobile.startup/mfExtend' ),
	MessageBox = require( '../mobile.startup/MessageBox' ),
	mwUser = mw.user;

/**
 * 'Edit' button
 * @param {OO.ui.ToolGroup} toolGroup
 * @param {Object} config
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
 * @memberof EditVeTool
 * @instance
 */
EditVeTool.prototype.onSelect = function () {
	// will be overridden later
};
/**
 * Toolbar update state handler.
 * @memberof EditVeTool
 * @instance
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
 * @param {Object} params Configuration options
 * @param {number|null} params.editCount of user
 */
function EditorOverlayBase( params ) {
	var self = this,
		options = util.extend(
			true,
			{
				className: 'overlay editor-overlay',
				isBorderBox: false
			},
			params,
			{
				events: util.extend(
					{
						'click .back': 'onClickBack',
						'click .continue': 'onClickContinue',
						'click .submit': 'onClickSubmit'
					},
					params.events
				)
			}
		);

	if ( options.isNewPage ) {
		options.placeholder = mw.msg( 'mobile-frontend-editor-placeholder-new-page', mwUser );
	}
	// change the message to request a summary when not in article namespace
	if ( mw.config.get( 'wgNamespaceNumber' ) !== 0 ) {
		options.summaryRequestMsg = mw.msg( 'mobile-frontend-editor-summary' );
	}
	this.pageGateway = new PageGateway( options.api );
	this.editCount = options.editCount;
	this.isNewPage = options.isNewPage;
	this.isNewEditor = options.editCount === 0;
	this.sectionId = options.sectionId;
	// FIXME: Pass this in via options rather than accessing mw.config
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

	Overlay.call( this, options );
}

mfExtend( EditorOverlayBase, Overlay, {
	/**
	 * @memberof EditorOverlayBase
	 * @instance
	 * @mixes Overlay#defaults
	 * @property {Object} defaults Default options hash.
	 * @property {OverlayManager} defaults.overlayManager instance
	 * @property {mw.Api} defaults.api to interact with
	 * @property {boolean} defaults.hasToolbar Whether the editor has a toolbar or not. When
	 *  disabled a header will be show instead.
	 * @property {string} defaults.continueMsg Caption for the next button on edit form
	 * which takes you to the screen that shows a preview and license information.
	 * @property {string} defaults.cancelMsg Caption for cancel button on edit form.
	 * @property {string} defaults.closeMsg Caption for a button that takes you back to editing
	 * from edit preview screen.
	 * @property {string} defaults.summaryRequestMsg Header above edit summary input field
	 * asking the user to summarize the changes they made to the page.
	 * @property {string} defaults.summaryMsg A placeholder with examples for the summary input
	 * field asking user what they changed.
	 * @property {string} defaults.placeholder Placeholder text for empty sections.
	 * @property {string} defaults.waitMsg Text that displays while a page edit is being saved.
	 * @property {string} defaults.waitIcon HTML of the icon that displays while a page edit
	 * is being saved.
	 * @property {string} defaults.captchaMsg Placeholder for captcha input field.
	 * @property {string} defaults.captchaTryAgainMsg A message shown when user enters
	 * wrong CAPTCHA and a new one is displayed.
	 * @property {string} defaults.switchMsg Label for button that allows the user
	 * to switch between two different editing interfaces.
	 * @property {string} defaults.licenseMsg Text and link of the license,
	 * under which this contribution will be released to inform the user.
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
		// icons.spinner can't be used,
		// the spinner class changes to display:none in onStageChanges
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
	/**
	 * @inheritdoc
	 * @memberof EditorOverlayBase
	 * @instance
	 */
	templatePartials: util.extend( {}, Overlay.prototype.templatePartials, {
		editHeader: mw.template.get( 'mobile.editor.overlay', 'editHeader.hogan' ),
		previewHeader: mw.template.get( 'mobile.editor.overlay', 'previewHeader.hogan' ),
		saveHeader: mw.template.get( 'mobile.editor.overlay', 'saveHeader.hogan' )
	} ),
	/**
	 * @inheritdoc
	 * @memberof EditorOverlayBase
	 * @instance
	 */
	template: mw.template.get( 'mobile.editor.overlay', 'EditorOverlayBase.hogan' ),
	/**
	 * @memberof EditorOverlayBase
	 * @instance
	 */
	sectionId: '',
	/**
	 * Logs an event to http://meta.wikimedia.org/wiki/Schema:EditAttemptStep
	 * @memberof EditorOverlayBase
	 * @instance
	 * @param {Object} data
	 */
	log: function ( data ) {
		mw.track( 'mf.schemaEditAttemptStep', util.extend( data, {
			// eslint-disable-next-line camelcase
			editor_interface: this.editor,
			// eslint-disable-next-line camelcase
			editing_session_id: this.sessionId
		} ) );
	},

	/**
	 * If this is a new article, require confirmation before saving.
	 * @memberof EditorOverlayBase
	 * @instance
	 * @return {boolean} The user confirmed saving
	 */
	confirmSave: function () {
		if ( this.isNewPage &&
			// TODO: Replace with an OOUI dialog
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
	 * @memberof EditorOverlayBase
	 * @instance
	 */
	onSaveComplete: function () {
		var msg,
			$window = util.getWindow(),
			title = this.options.title,
			self = this;

		this.saved = true;

		// FIXME: use generic method for following 3 lines
		this.pageGateway.invalidatePage( title );

		if ( this.isNewPage ) {
			msg = mw.msg( 'mobile-frontend-editor-success-new-page' );
		} else if ( this.isNewEditor ) {
			msg = mw.msg( 'mobile-frontend-editor-success-landmark-1' );
		} else {
			msg = mw.msg( 'mobile-frontend-editor-success' );
		}
		toast.showOnPageReload( msg, { type: 'success' } );

		// Ensure we don't lose this event when logging
		this.log( {
			action: 'saveSuccess'
		} );
		if ( self.sectionId ) {
			// Ideally we'd want to do this via replaceState (see T189173)
			// eslint-disable-next-line no-restricted-properties
			window.location.hash = '#' + self.sectionId;
		} else {
			// Cancel the hash fragment
			// otherwise clicking back after a save will take you back to the editor.
			// We avoid calling the hide method of the overlay here as this can be asynchronous
			// and may conflict with the window.reload call below.
			// eslint-disable-next-line no-restricted-properties
			window.location.hash = '#';
		}

		$window.off( 'beforeunload.mfeditorwarning' );

		// Note the "#" may be in the URL.
		// If so, using window.location alone will not reload the page
		// we need to forcefully refresh
		// eslint-disable-next-line no-restricted-properties
		window.location.reload();
	},
	/**
	 * Executed when page save fails. Handles logging the error. Subclasses
	 * should display error messages as appropriate.
	 * @memberof EditorOverlayBase
	 * @instance
	 * @param {Object} data Details about the failure, from EditorGateway.parseSaveError
	 */
	onSaveFailure: function ( data ) {
		var key = data && data.details && data.details.code,
			typeMap = {
				editconflict: 'editConflict',
				wasdeleted: 'editPageDeleted',
				'abusefilter-disallowed': 'extensionAbuseFilter',
				captcha: 'extensionCaptcha',
				spamprotectiontext: 'extensionSpamBlacklist',
				'titleblacklist-forbidden-edit': 'extensionTitleBlacklist'
			};

		if ( data.type === 'captcha' ) {
			key = 'captcha';
		}

		this.log( {
			action: 'saveFailure',
			message: saveFailureMessage( data ),
			type: typeMap[key] || 'responseUnknown'
		} );
	},
	/**
	 * Report load errors back to the user. Silently record the error using EventLogging.
	 * @memberof EditorOverlayBase
	 * @instance
	 * @param {string} text Text of message to display to user
	 * @param {string} heading heading text to display to user
	 */
	reportError: function ( text, heading ) {
		var errorNotice = new MessageBox( {
			className: 'errorbox',
			msg: text,
			heading: heading
		} );
		this.$errorNoticeContainer.html( errorNotice.$el );
	},
	hideErrorNotice: function () {
		this.$errorNoticeContainer.empty();
	},
	/**
	 * Prepares the penultimate screen before saving.
	 * Expects to be overridden by child class.
	 * @memberof EditorOverlayBase
	 * @instance
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
	 * @memberof EditorOverlayBase
	 * @instance
	 */
	onSaveBegin: function () {
		this.confirmAborted = false;
		this.hideErrorNotice();
		// Ask for confirmation in some cases
		if ( !this.confirmSave() ) {
			this.confirmAborted = true;
			return;
		}
		this.log( {
			action: 'saveAttempt'
		} );
	},
	/**
	 * @inheritdoc
	 * @memberof EditorOverlayBase
	 * @instance
	 */
	postRender: function () {
		// log edit attempt
		// TODO: if VE/NWE become the default, or even loadable-by-URL, this
		// logging needs to be moved into the individual overlays, because postRender
		// for VE still wouldn't technically be 'ready'.
		this.log( {
			action: 'ready'
		} );
		this.log( {
			action: 'loaded'
		} );

		// decide what happens, when the user clicks the continue button
		if ( this.config.skipPreview ) {
			// skip the preview and save the changes
			this.nextStep = 'onSaveBegin';
			this.$el.find( '.continue' ).text( this.defaults.saveMsg );
		} else {
			// default: show the preview step
			this.nextStep = 'onStageChanges';
		}
		this.$errorNoticeContainer = this.$el.find( '#error-notice-container' );

		Overlay.prototype.postRender.apply( this );

		this.showHidden( '.initial-header' );
	},
	show: function () {
		this.saved = false;
		Overlay.prototype.show.call( this );

		// Inform other interested code that the editor has loaded
		mw.hook( 'mobileFrontend.editorOpened' ).fire( this.editor );
	},
	/**
	 * Back button click handler
	 * @memberof EditorOverlayBase
	 * @instance
	 */
	onClickBack: function () {},
	/**
	 * Submit button click handler
	 * @memberof EditorOverlayBase
	 * @instance
	 */
	onClickSubmit: function () {
		this.onSaveBegin();
	},
	/**
	 * Continue button click handler
	 * @memberof EditorOverlayBase
	 * @instance
	 */
	onClickContinue: function () {
		this[this.nextStep]();
	},
	/**
	 * @inheritdoc
	 * @memberof EditorOverlayBase
	 * @instance
	 * @return {boolean|jQuery.Promise} Boolean, or promise resolving with a boolean
	 */
	hide: function () {
		var windowManager,
			self = this;
		if ( this.hasChanged() ) {
			windowManager = OO.ui.getWindowManager();
			windowManager.addWindows( [ new mw.widgets.AbandonEditDialog() ] );
			return windowManager.openWindow( 'abandonedit' )
				.closed.then( function ( data ) {
					if ( data && data.action === 'discard' ) {
						// log abandonment
						self.log( {
							action: 'abort',
							mechanism: 'cancel',
							type: 'abandon'
						} );
						self.allowCloseWindow.release();
						mw.hook( 'mobileFrontend.editorClosed' ).fire();
						Overlay.prototype.hide.call( self );
					}
				} );
		}
		if ( !this.switching && !this.saved ) {
			// log leaving without changes
			this.log( {
				action: 'abort',
				mechanism: 'cancel',
				// if this is VE, hasChanged will be false because the Surface has
				// already been destroyed (which is good because it stops us
				// double-showing the abandon changes dialog above)... but we can
				// test whether there *were* changes for logging purposes by
				// examining the target:
				type: ( this.target && this.target.edited ) ? 'abandon' : 'nochange'
			} );
		}
		this.allowCloseWindow.release();
		mw.hook( 'mobileFrontend.editorClosed' ).fire();
		return Overlay.prototype.hide.call( self );
	},
	/**
	 * Check, if the user should be asked if they really want to leave the page.
	 * Returns false, if he hasn't made changes, otherwise true.
	 * @memberof EditorOverlayBase
	 * @instance
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
	 * @memberof EditorOverlayBase
	 * @instance
	 */
	hasChanged: function () {},
	/**
	 * Handles a failed save due to a CAPTCHA provided by ConfirmEdit extension.
	 * @memberof EditorOverlayBase
	 * @instance
	 * @param {Object} details Details returned from the api.
	 */
	handleCaptcha: function ( details ) {
		var self = this,
			$input = this.$el.find( '.captcha-word' );

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
			this.$el.find( '.captcha-panel#question' ).detach();
			this.$el.find( '.captcha-panel img' ).attr( 'src', details.url );
		} else {
			// not image based CAPTCHA.
			this.$el.find( '.captcha-panel #image' ).detach();
			if ( details.mime.indexOf( 'text/html' ) === 0 ) {
				// handle mime type of HTML as HTML content (display as-is).
				// QuestyCaptcha now have default MIME type "text/html": see T147606
				this.$el.find( '.captcha-panel #question' ).html( details.question );
			} else {
				// handle mime types
				// (other than image based ones and HTML based ones)
				// as plain text by default.
				// e.g. MathCaptcha (solve a math formula) or
				// SimpleCaptcha (simple math formula)
				this.$el.find( '.captcha-panel #question' ).text( details.question );
			}
		}

		this.showHidden( '.save-header, .captcha-panel' );
		this.captchaShown = true;
	}
} );

module.exports = EditorOverlayBase;
