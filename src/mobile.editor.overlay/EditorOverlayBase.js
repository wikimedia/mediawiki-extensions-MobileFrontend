/* global $ */
var Overlay = require( '../mobile.startup/Overlay' ),
	util = require( '../mobile.startup/util' ),
	parseBlockInfo = require( './parseBlockInfo' ),
	headers = require( '../mobile.startup/headers' ),
	PageGateway = require( '../mobile.startup/PageGateway' ),
	icons = require( '../mobile.startup/icons' ),
	Button = require( '../mobile.startup/Button' ),
	toast = require( '../mobile.startup/toast' ),
	saveFailureMessage = require( './saveFailureMessage' ),
	mfExtend = require( '../mobile.startup/mfExtend' ),
	blockMessageDrawer = require( './blockMessageDrawer' ),
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
 * Base class for SourceEditorOverlay and VisualEditorOverlay
 * @class EditorOverlayBase
 * @extends Overlay
 * @uses Icon
 * @uses user
 * @param {Object} params Configuration options
 * @params {Object} [params.editorOptions] falls back to wgMFEditorOptions if undefined
 * @param {number|null} params.editCount of user
 * @param {boolean} params.editSwitcher whether possible to switch mode in header
 * @param {boolean} params.hasToolbar whether the editor has a toolbar
 */
function EditorOverlayBase( params ) {
	var
		options = util.extend(
			true,
			{
				onBeforeExit: this.onBeforeExit.bind( this ),
				className: 'overlay editor-overlay',
				isBorderBox: false
			},
			params,
			{
				events: util.extend(
					{
						'click .back': 'onClickBack',
						'click .continue': 'onClickContinue',
						'click .submit': 'onClickSubmit',
						'click .anonymous': 'onClickAnonymous'
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
	this.config = params.editorOptions || mw.config.get( 'wgMFEditorOptions' );
	this.sessionId = options.sessionId;
	this.overlayManager = options.overlayManager;

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
	 * @property {string} defaults.closeMsg Caption for a button that takes you back to editing
	 * from edit preview screen.
	 * @property {string} defaults.summaryRequestMsg Header above edit summary input field
	 * asking the user to summarize the changes they made to the page.
	 * @property {string} defaults.summaryMsg A placeholder with examples for the summary input
	 * field asking user what they changed.
	 * @property {string} defaults.placeholder Placeholder text for empty sections.
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
		closeMsg: mw.msg( 'mobile-frontend-editor-keep-editing' ),
		summaryRequestMsg: mw.msg( 'mobile-frontend-editor-summary-request' ),
		summaryMsg: mw.msg( 'mobile-frontend-editor-summary-placeholder' ),
		placeholder: mw.msg( 'mobile-frontend-editor-placeholder' ),
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
	template: util.template( `
<div class="overlay-header-container header-container position-fixed"></div>

<div class="overlay-content">
	<div class="panels">
		<div class="save-panel panel hideable hidden">
			<div id="error-notice-container"></div>
			<h2 class="summary-request">{{{summaryRequestMsg}}}</h2>
			<textarea rows="2" class="mw-ui-input summary" placeholder="{{summaryMsg}}"></textarea>
			{{#licenseMsg}}<div class="license">{{{licenseMsg}}}</div>{{/licenseMsg}}
		</div>
		<div class="captcha-panel panel hideable hidden">
			<div class="captcha-box">
				<img id="image" src="">
				<div id="question"></div>
				<input class="captcha-word mw-ui-input" placeholder="{{captchaMsg}}" />
			</div>
		</div>
	</div>
	{{>content}}
</div>
<div class="overlay-footer-container position-fixed">
	{{>footer}}
</div>
	` ),
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
	 * Logs an event to http://meta.wikimedia.org/wiki/Schema:VisualEditorFeatureUse
	 * @memberof EditorOverlayBase
	 * @instance
	 * @param {Object} data
	 */
	logFeatureUse: function ( data ) {
		mw.track( 'mf.schemaVisualEditorFeatureUse', util.extend( data, {
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
	 * @param {number} newRevId ID of the newly created revision
	 */
	onSaveComplete: function ( newRevId ) {
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
			action: 'saveSuccess',
			// eslint-disable-next-line camelcase
			revision_id: newRevId
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
	 * @param {Object} data API response
	 */
	onSaveFailure: function ( data ) {
		var key = data && data.errors && data.errors[0] && data.errors[0].code,
			// TODO: This looks incomplete and most of the error codes are wrong.
			// Compare to ve.init.mw.ArticleTargetEvents.js in VisualEditor.
			typeMap = {
				editconflict: 'editConflict',
				wasdeleted: 'editPageDeleted',
				'abusefilter-disallowed': 'extensionAbuseFilter',
				captcha: 'extensionCaptcha',
				spamprotectiontext: 'extensionSpamBlacklist',
				'titleblacklist-forbidden-edit': 'extensionTitleBlacklist'
			};

		if ( data.edit && data.edit.captcha ) {
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
	 * @param {string} text Text (HTML) of message to display to user
	 */
	reportError: function ( text ) {
		var errorNotice = new MessageBox( {
			className: 'errorbox',
			msg: text,
			heading: mw.msg( 'mobile-frontend-editor-error' )
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
		this.hideErrorNotice();
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
	 */
	preRender: function () {
		const options = this.options;

		this.options.headers = [
			headers.formHeader(
				util.template( `
{{^hasToolbar}}
<div class="overlay-title">
	<h2>{{{editingMsg}}}</h2>
</div>
{{/hasToolbar}}
{{#hasToolbar}}<div class="toolbar"></div>{{/hasToolbar}}
{{#editSwitcher}}
	<div class="switcher-container">
	</div>
{{/editSwitcher}}
				` ).render( {
					hasToolbar: options.hasToolbar,
					editSwitcher: options.editSwitcher,
					editingMsg: options.editingMsg
				} ),
				options.readOnly ? [] : [
					new Button( {
						tagName: 'button',
						additionalClassNames: 'continue',
						disabled: true,
						label: this.config.skipPreview ?
							util.saveButtonMessage() :
							options.continueMsg
					} )
				],
				icons.cancel(),
				'initial-header'
			),
			headers.saveHeader( options.previewingMsg, 'save-header hidden' ),
			headers.savingHeader( mw.msg( 'mobile-frontend-editor-wait' ) )
		];
	},
	/**
	 * @inheritdoc
	 * @memberof EditorOverlayBase
	 * @instance
	 */
	postRender: function () {
		// decide what happens, when the user clicks the continue button
		if ( this.config.skipPreview ) {
			// skip the preview and save the changes
			this.nextStep = 'onSaveBegin';
		} else {
			// default: show the preview step
			this.nextStep = 'onStageChanges';
		}
		this.$errorNoticeContainer = this.$el.find( '#error-notice-container' );

		Overlay.prototype.postRender.apply( this );

		this.showHidden( '.initial-header' );
	},
	show: function () {
		var self = this;
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
	 * "Edit without logging in" button click handler
	 * @memberof EditorOverlayBase
	 * @instance
	 */
	onClickAnonymous: function () {},
	/**
	 * @memberof EditorOverlayBase
	 * @instance
	 * @param {Function} exit Callback to exit the overlay
	 */
	onBeforeExit: function ( exit ) {
		var windowManager,
			self = this;
		if ( this.hasChanged() && !this.switching ) {
			windowManager = OO.ui.getWindowManager();
			windowManager.addWindows( [ new mw.widgets.AbandonEditDialog() ] );
			windowManager.openWindow( 'abandonedit' )
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
						exit();
					}
				} );
			return;
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
		exit();
	},
	/**
	 * Sets additional values used for anonymous editing warning.
	 * @memberof EditorOverlayBase
	 * @instance
	 * @param {Object} options
	 * @return {jQuery.Element}
	 */
	createAnonWarning: function ( options ) {
		var $actions = $( '<div>' ).addClass( 'actions' ),
			$anonWarning = $( '<div>' ).addClass( 'anonwarning content' ).append(
				new MessageBox( {
					className: 'warningbox anon-msg',
					msg: mw.msg( 'mobile-frontend-editor-anonwarning' )
				} ).$el,
				$actions
			),
			params = util.extend( {
			// use wgPageName as this includes the namespace if outside Main
				returnto: options.returnTo || mw.config.get( 'wgPageName' ),
				returntoquery: 'action=edit&section=' + options.sectionId,
				warning: 'mobile-frontend-edit-login-action'
			}, options.queryParams ),
			signupParams = util.extend( {
				type: 'signup',
				warning: 'mobile-frontend-edit-signup-action'
			}, options.signupQueryParams ),
			anonymousEditorActions = [
				new Button( {
					label: mw.msg( 'mobile-frontend-editor-anon' ),
					block: true,
					additionalClassNames: 'anonymous progressive',
					progressive: true
				} ),
				new Button( {
					block: true,
					href: mw.util.getUrl( 'Special:UserLogin', params ),
					label: mw.msg( 'mobile-frontend-watchlist-cta-button-login' )
				} ),
				new Button( {
					block: true,
					href: mw.util.getUrl( 'Special:UserLogin', util.extend( params, signupParams ) ),
					label: mw.msg( 'mobile-frontend-watchlist-cta-button-signup' )
				} )
			];

		$actions.append(
			anonymousEditorActions.map( function ( action ) {
				return action.$el;
			} )
		);

		return $anonWarning;
	},

	/**
	 * Get an options object not containing any defaults or editor
	 * specific options, so that it can be used to construct a
	 * different editor for switching.
	 *
	 * @return {Object} Options
	 */
	getOptionsForSwitch: function () {
		// Only preserve options that would be passed in editor.js#setupEditor
		// and skip over defaults.
		return {
			switched: true,
			overlayManager: this.options.overlayManager,
			currentPageHTMLParser: this.options.currentPageHTMLParser,
			fakeScroll: this.options.fakeScroll,
			api: this.options.api,
			licenseMsg: this.options.licenseMsg,
			title: this.options.title,
			titleObj: this.options.titleObj,
			isAnon: this.options.isAnon,
			isNewPage: this.options.isNewPage,
			editCount: this.options.editCount,
			oldId: this.options.oldId,
			contentLang: this.options.contentLang,
			contentDir: this.options.contentDir,
			sessionId: this.options.sessionId,
			sectionId: this.options.sectionId
		};
	},

	/**
	 * Checks whether the state of the thing being edited as changed. Expects to be
	 * implemented by child class.
	 * @memberof EditorOverlayBase
	 * @instance
	 */
	hasChanged: function () {},
	/**
	 * Get a promise that is resolved when the editor data has loaded,
	 * or rejected when we're refusing to load the editor because the user is blocked.
	 * @memberof EditorOverlayBase
	 * @instance
	 * @return {jQuery.Promise}
	 */
	getLoadingPromise: function () {
		return this.dataPromise.then( function ( result ) {
			// check if user is blocked
			if ( result && result.blockinfo ) {
				// Lazy-load moment only if it's needed, it's somewhat large (it is already used on
				// mobile by Echo's notifications panel, where it's also lazy-loaded)
				return mw.loader.using( 'moment' ).then( function () {
					var block = parseBlockInfo( result.blockinfo ),
						message = blockMessageDrawer( block );
					return util.Deferred().reject( message );
				} );
			}
			return result;
		} );
	},
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
