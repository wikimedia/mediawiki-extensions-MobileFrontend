/* global $ */
/**
 * @class EditorOverlayBase
 * @private
 */
const mobile = require( 'mobile.startup' ),
	Overlay = mobile.Overlay,
	// Use MediaWiki ResourceLoader require(), not Webpack require()
	contLangMessages = (
		require( './contLangMessages.json' )
	),
	util = mobile.util,
	parseBlockInfo = require( './parseBlockInfo.js' ),
	headers = mobile.headers,
	Button = mobile.Button,
	IconButton = mobile.IconButton,
	mfExtend = mobile.mfExtend,
	blockMessageDrawer = require( './blockMessageDrawer.js' ),
	MessageBox = mobile.MessageBox,
	mwUser = mw.user;

/**
 * 'Edit' button
 *
 * @param {OO.ui.ToolGroup} toolGroup
 * @param {Object} config
 * @private
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
 *
 * @memberof EditVeTool
 * @instance
 */
EditVeTool.prototype.onSelect = function () {
	// will be overridden later
};
/**
 * Toolbar update state handler.
 *
 * @memberof EditVeTool
 * @instance
 */
EditVeTool.prototype.onUpdateState = function () {
	// do nothing
};

/**
 * Base class for SourceEditorOverlay and VisualEditorOverlay
 *
 * @class EditorOverlayBase
 * @private
 * @extends Overlay
 * @uses IconButton
 * @uses user
 * @param {Object} params Configuration options
 * @param {boolean} params.editSwitcher whether possible to switch mode in header
 * @param {boolean} params.hasToolbar whether the editor has a toolbar
 */
function EditorOverlayBase( params ) {
	const
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
	this.isNewPage = options.isNewPage;
	this.sectionId = options.sectionId;
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
			<div class="summary-input"></div>
			{{#licenseMsg}}<div class="license">{{{licenseMsg}}}</div>{{/licenseMsg}}
		</div>
		<div class="captcha-panel panel hideable hidden">
			<div class="captcha-box">
				<img id="image" src="">
				<div id="question"></div>
				<div class="cdx-text-input">
					<input class="captcha-word cdx-text-input__input" placeholder="{{captchaMsg}}" />
				</div>
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

	fakeToolbar() {
		return this.options.fakeToolbar;
	},
	/**
	 * Logs an event to http://meta.wikimedia.org/wiki/Schema:EditAttemptStep
	 *
	 * @memberof EditorOverlayBase
	 * @instance
	 * @param {Object} data
	 */
	log: function ( data ) {
		mw.track( 'editAttemptStep', util.extend( data, {
			// eslint-disable-next-line camelcase
			editor_interface: this.editor
		} ) );
	},
	/**
	 * Logs an event to http://meta.wikimedia.org/wiki/Schema:VisualEditorFeatureUse
	 *
	 * @memberof EditorOverlayBase
	 * @instance
	 * @param {Object} data
	 */
	logFeatureUse: function ( data ) {
		mw.track( 'visualEditorFeatureUse', util.extend( data, {
			// eslint-disable-next-line camelcase
			editor_interface: this.editor
		} ) );
	},

	/**
	 * If this is a new article, require confirmation before saving.
	 *
	 * @memberof EditorOverlayBase
	 * @instance
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
	 * Executed when page save is complete. Updates urls and shows toast message.
	 *
	 * @memberof EditorOverlayBase
	 * @instance
	 * @param {number|null} newRevId ID of the newly created revision, or null if it was a
	 * null edit.
	 * @param {string} [redirectUrl] URL to redirect to, if different than the current URL.
	 * @param {boolean} [tempUserCreated] Whether a temporary user was created
	 */
	onSaveComplete: function ( newRevId, redirectUrl, tempUserCreated ) {
		this.saved = true;

		if ( newRevId ) {
			let action;
			if ( this.isNewPage ) {
				action = 'created';
			} else if ( this.options.oldId ) {
				action = 'restored';
			} else {
				action = 'saved';
			}
			this.showSaveCompleteMsg( action, tempUserCreated );
		}

		// Ensure we don't lose this event when logging
		this.log( {
			action: 'saveSuccess',
			// eslint-disable-next-line camelcase
			revision_id: newRevId
		} );
		if ( tempUserCreated && redirectUrl ) {
			// The caller handles this redirect, either in SourceEditorOverlay or in VE's ArticleTarget
			return;
		}
		setTimeout( () => {
			// Wait for any other teardown navigation to happen (e.g. router.back())
			// before setting our final location.
			if ( redirectUrl ) {
				// eslint-disable-next-line no-restricted-properties
				window.location.href = redirectUrl;
			} else if ( this.sectionId ) {
				// Ideally we'd want to do this via replaceState (see T189173)
				// eslint-disable-next-line no-restricted-properties
				window.location.hash = '#' + this.sectionId;
			} else {
				// Cancel the hash fragment
				// otherwise clicking back after a save will take you back to the editor.
				// We avoid calling the hide method of the overlay here as this can be asynchronous
				// and may conflict with the window.reload call below.
				// eslint-disable-next-line no-restricted-properties
				window.location.hash = '#';
			}
		} );
	},
	/**
	 * Show a save-complete message to the user
	 *
	 * @inheritdoc
	 * @memberof VisualEditorOverlay
	 * @instance
	 * @param {string} action One of 'saved', 'created', 'restored'
	 * @param {boolean} [tempUserCreated] Whether a temporary user was created
	 */
	showSaveCompleteMsg: function ( action, tempUserCreated ) {
		require( 'mediawiki.action.view.postEdit' ).fireHook( action, tempUserCreated );
	},
	/**
	 * Executed when page save fails. Handles logging the error. Subclasses
	 * should display error messages as appropriate.
	 *
	 * @memberof EditorOverlayBase
	 * @instance
	 * @param {Object} data API response
	 */
	onSaveFailure: function ( data ) {
		let code = data && data.errors && data.errors[0] && data.errors[0].code;

		const
			// Compare to ve.init.mw.ArticleTargetEvents.js in VisualEditor.
			typeMap = {
				badtoken: 'userBadToken',
				assertanonfailed: 'userNewUser',
				assertuserfailed: 'userNewUser',
				assertnameduserfailed: 'userNewUser',
				'abusefilter-disallowed': 'extensionAbuseFilter',
				'abusefilter-warning': 'extensionAbuseFilter',
				captcha: 'extensionCaptcha',
				// FIXME: This language is non-inclusive and we would love to change it,
				// but this relates to an error code provided by software.
				// This is blocked on T254649
				spamblacklist: 'extensionSpamBlacklist',
				// FIXME: This language is non-inclusive and we would love to change it,
				// but this relates to an error code provided by software.
				// Removal of this line is blocked on T254650.
				'titleblacklist-forbidden': 'extensionTitleBlacklist',
				pagedeleted: 'editPageDeleted',
				editconflict: 'editConflict'
			};

		if ( data.edit && data.edit.captcha ) {
			code = 'captcha';
		}

		this.log( {
			action: 'saveFailure',
			message: code,
			type: typeMap[code] || 'responseUnknown'
		} );
	},
	/**
	 * Report load errors back to the user. Silently record the error using EventLogging.
	 *
	 * @memberof EditorOverlayBase
	 * @instance
	 * @param {string} text Text (HTML) of message to display to user
	 */
	reportError: function ( text ) {
		const errorNotice = new MessageBox( {
			type: 'error',
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
	 *
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
	 *
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
					new IconButton( {
						tagName: 'button',
						action: 'progressive',
						weight: 'primary',
						icon: 'next-invert',
						additionalClassNames: 'continue',
						disabled: true,
						title: options.continueMsg
					} )
				],
				mobile.cancelIcon(),
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
		this.$errorNoticeContainer = this.$el.find( '#error-notice-container' );

		Overlay.prototype.postRender.apply( this );
		this.showHidden( '.initial-header' );
	},
	show: function () {
		this.allowCloseWindow = mw.confirmCloseWindow( {
			// Returns true if content has changed
			test: () => this.hasChanged(),

			// Message to show the user, if content has changed
			message: mw.msg( 'mobile-frontend-editor-cancel-confirm' ),
			// Event namespace
			namespace: 'editwarning'
		} );

		this.saved = false;
		Overlay.prototype.show.call( this );

		// Inform other interested code that the editor has loaded
		/**
		 * Internal for use in ContentTranslation and GrowthExperiments only.
		 *
		 * @event ~'mobileFrontend.editorOpened'
		 * @memberof Hooks
		 */
		mw.hook( 'mobileFrontend.editorOpened' ).fire( this.editor );
	},
	/**
	 * Back button click handler
	 *
	 * @memberof EditorOverlayBase
	 * @instance
	 */
	onClickBack: function () {},
	/**
	 * Submit button click handler
	 *
	 * @memberof EditorOverlayBase
	 * @instance
	 */
	onClickSubmit: function () {
		this.onSaveBegin();
	},
	/**
	 * Continue button click handler
	 *
	 * @memberof EditorOverlayBase
	 * @instance
	 */
	onClickContinue: function () {
		this.onStageChanges();
	},
	/**
	 * "Edit without logging in" button click handler
	 *
	 * @memberof EditorOverlayBase
	 * @instance
	 */
	onClickAnonymous: function () {},
	/**
	 * @memberof EditorOverlayBase
	 * @instance
	 * @param {Function} exit Callback to exit the overlay
	 * @param {Function} cancel Callback to cancel exiting the overlay
	 */
	onBeforeExit: function ( exit, cancel ) {
		if ( this.hasChanged() && !this.switching ) {
			if ( !this.windowManager ) {
				this.windowManager = OO.ui.getWindowManager();
				this.windowManager.addWindows( [ new mw.widgets.AbandonEditDialog() ] );
			}
			this.windowManager.openWindow( 'abandonedit' )
				.closed.then( ( data ) => {
					if ( data && data.action === 'discard' ) {
						// log abandonment
						this.log( {
							action: 'abort',
							mechanism: 'cancel',
							type: 'abandon'
						} );
						this.onExit();
						exit();
					}
				} );
			cancel();
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
		this.onExit();
		exit();
		if ( mw.config.get( 'wgAction' ) === 'edit' ) {
			// We got into the overlay via directly visiting an action=edit
			// URL, which has been taken over. As such, depending on
			// how we got here, the normal overlay process isn't going to
			// produce the correct result.
			setTimeout( () => {
				// This needs to happen after the overlay-hide has completed
				// so we have access to the "real" URL, and `exit`
				// unfortunately doesn't expose a promise for this. There's
				// several setTimeouts within the hide, so we're just going
				// to use a long-enough setTimeout of our own to skip those.
				if ( !mw.util.getParamValue( 'veaction' ) && !mw.util.getParamValue( 'action' ) ) {
					// Use reload if possible, to emulate having gone back
					location.reload();
				} else {
					location.href = mw.util.getUrl();
				}
			}, 100 );
		}
	},
	onExit: function () {
		// May not be set if overlay has not been previously shown
		if ( this.allowCloseWindow ) {
			this.allowCloseWindow.release();
		}
		/**
		 * Internal for use in ContentTranslation and GrowthExperiments only.
		 *
		 * @event ~'mobileFrontend.editorClosed'
		 * @memberof Hooks
		 */
		mw.hook( 'mobileFrontend.editorClosed' ).fire();
	},
	/**
	 * Sets additional values used for anonymous editing warning.
	 *
	 * @memberof EditorOverlayBase
	 * @instance
	 * @param {Object} options
	 * @return {jQuery.Element}
	 */
	createAnonWarning: function ( options ) {
		const $actions = $( '<div>' ).addClass( 'actions' ),
			msg = this.gateway.wouldautocreate ?
				'mobile-frontend-editor-autocreatewarning' :
				'mobile-frontend-editor-anonwarning',
			$anonWarning = $( '<div>' ).addClass( 'anonwarning content' ).append(
				new MessageBox( {
					type: 'notice',
					className: 'anon-msg',
					// eslint-disable-next-line mediawiki/msg-doc
					msg: mw.message( msg, contLangMessages[ 'tempuser-helppage' ] ).parse()
				} ).$el,
				$actions
			),
			params = util.extend( {
				returnto: options.returnTo || (
					// use wgPageName as this includes the namespace if outside Main
					mw.config.get( 'wgPageName' ) + '#/editor/' + ( options.sectionId || 'all' )
				),
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
			anonymousEditorActions.map( ( action ) => action.$el )
		);

		return $anonWarning;
	},
	/**
	 * Creates and returns a copy of the anon talk message warning
	 *
	 * @memberof EditorOverlayBase
	 * @instance
	 * @return {jQuery.Element}
	 */
	createAnonTalkWarning: function () {
		return $( '.minerva-anon-talk-message' ).clone();
	},
	/**
	 * Get an options object not containing any defaults or editor
	 * specific options, so that it can be used to construct a
	 * different editor for switching.
	 *
	 * @memberof EditorOverlayBase
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
			oldId: this.options.oldId,
			contentLang: this.options.contentLang,
			contentDir: this.options.contentDir,
			sectionId: this.options.sectionId
		};
	},

	/**
	 * Checks whether the state of the thing being edited as changed. Expects to be
	 * implemented by child class.
	 *
	 * @memberof EditorOverlayBase
	 * @instance
	 */
	hasChanged: function () {},
	/**
	 * Get a promise that is resolved when the editor data has loaded,
	 * or rejected when we're refusing to load the editor because the user is blocked.
	 *
	 * @memberof EditorOverlayBase
	 * @instance
	 * @return {jQuery.Promise}
	 */
	getLoadingPromise: function () {
		return this.dataPromise.then( ( result ) => {
			// check if user is blocked
			if ( result && result.blockinfo ) {
				const block = parseBlockInfo( result.blockinfo ),
					message = blockMessageDrawer( block );
				return util.Deferred().reject( message );
			}
			return result;
		} );
	},
	showEditNotices: function () {
		if ( mw.config.get( 'wgMFEditNoticesFeatureConflict' ) ) {
			return;
		}
		this.getLoadingPromise().then( ( data ) => {
			if ( data.notices ) {
				const editNotices = Object.keys( data.notices ).filter( ( key ) => {
					if ( key.indexOf( 'editnotice' ) !== 0 ) {
						return false;
					}
					if ( key === 'editnotice-notext' ) {
						// This notice is shown on pages which don't have any
						// other edit notices. It's blank by default, but
						// some wikis have it template-generated and hidden
						// by CSS. It's filtered out from VE's API response,
						// but not from the source mode.
						return false;
					}
					// The contents of an edit notice is unlikely to change in the 24 hour
					// expiry window, so just record that a notice with this key has been shown.
					// If a cheap hashing function was available in core (or the API provided
					// as hash) it could be used here instead.
					const storageKey = 'mf-editnotices/' + mw.config.get( 'wgPageName' ) + '#' + key;
					if ( mw.storage.get( storageKey ) ) {
						return false;
					}
					mw.storage.set( storageKey, '1', 24 * 60 * 60 );
					return true;
				} );

				if ( editNotices.length ) {
					mw.loader.using( 'oojs-ui-windows' ).then( () => {
						const $container = $( '<div>' ).addClass( 'editor-overlay-editNotices' );
						editNotices.forEach( ( key ) => {
							const $notice = $( '<div>' ).append( data.notices[ key ] );
							$notice.addClass( 'editor-overlay-editNotice' );
							$container.append( $notice );
						} );
						OO.ui.alert( $container );

						this.logFeatureUse( {
							feature: 'notices',
							action: 'show'
						} );
					} );
				}
			}
		} );
	},
	/**
	 * Handles a failed save due to a CAPTCHA provided by ConfirmEdit extension.
	 *
	 * @memberof EditorOverlayBase
	 * @instance
	 * @param {Object} details Details returned from the api.
	 */
	handleCaptcha: function ( details ) {
		const $input = this.$el.find( '.captcha-word' );

		if ( this.captchaShown ) {
			$input.val( '' );
			$input.attr( 'placeholder', this.options.captchaTryAgainMsg );
			setTimeout( () => {
				$input.attr( 'placeholder', this.options.captchaMsg );
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
