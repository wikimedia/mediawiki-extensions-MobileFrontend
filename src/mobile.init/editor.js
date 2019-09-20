/* global $ */
var M = require( '../mobile.startup/moduleLoaderSingleton' ),
	util = require( '../mobile.startup/util' ),
	editorLoadingOverlay = require( './editorLoadingOverlay' ),
	OverlayManager = require( '../mobile.startup/OverlayManager' ),
	// #ca-edit, .mw-editsection are standard MediaWiki elements
	// .edit-link comes from MobileFrontend user page creation CTA
	$allEditLinks = $( '#ca-edit, .mw-editsection a, .edit-link' ),
	user = mw.user,
	popup = require( '../mobile.startup/toast' ),
	CtaDrawer = require( '../mobile.startup/CtaDrawer' ),
	// FIXME: Disable on IE < 10 for time being
	blacklisted = /MSIE \d\./.test( navigator.userAgent ),
	contentModel = mw.config.get( 'wgPageContentModel' ),
	veConfig = mw.config.get( 'wgVisualEditorConfig' ),
	editCount = mw.config.get( 'wgUserEditCount' ),
	editorPath = /^\/editor\/(\d+|all)$/;

/**
 * Event handler for edit link clicks. Will prevent default link
 * behaviour and will not allow propagation
 * @method
 * @ignore
 * @param {HTMLElement} elem
 * @param {jQuery.Event} ev
 * @param {Router} router
 */
function onEditLinkClick( elem, ev, router ) {
	var section = ( new mw.Uri( elem.href ) ).query.section || 'all';
	if ( $allEditLinks.length === 1 ) {
		// If section edit links are not available, the only edit link
		// should allow editing the whole page (T232170)
		section = 'all';
	}
	router.navigate( '#/editor/' + section );
	// DO NOT USE stopPropagation or you'll break click tracking in WikimediaEvents
	// You DO NOT NEED to
	// prevent folding section when clicking Edit by stopping propagation
	// as this is a concern of the Toggler class and taken care of by inspecting
	// !ev.target.href (see Toggler.js)
	// avoid navigating to ?action=edit
	ev.preventDefault();
}

/**
 * Retrieve the user's preferred editor setting. If none is set, return the default
 * editor for this wiki.
 * @method
 * @ignore
 * @return {string} Either 'VisualEditor' or 'SourceEditor'
 */
function getPreferredEditor() {
	var preferredEditor = mw.storage.get( 'preferredEditor' );
	if ( preferredEditor ) {
		return preferredEditor;
	}
	switch ( mw.config.get( 'wgMFDefaultEditor' ) ) {
		case 'source':
			return 'SourceEditor';
		case 'visual':
			return 'VisualEditor';
		case 'preference':
			return mw.user.options.get( 'visualeditor-editor' ) === 'visualeditor' ? 'VisualEditor' : 'SourceEditor';
	}
	// In the event of misconfiguration, fall back to source
	return 'SourceEditor';
}

/**
 * Initialize the edit button so that it launches the editor interface when clicked.
 * @method
 * @ignore
 * @param {Page} page The page to edit.
 * @param {Skin} skin
 * @param {PageHTMLParser} currentPageHTMLParser
 * @param {Router} router
 */
function setupEditor( page, skin, currentPageHTMLParser, router ) {
	var uri, fragment, editorOverride,
		overlayManager = OverlayManager.getSingleton(),
		isNewPage = page.id === 0;

	$allEditLinks.on( 'click', function ( ev ) {
		onEditLinkClick( this, ev, overlayManager.router );
	} );
	overlayManager.add( editorPath, function ( sectionId ) {
		var
			scrollbarWidth = window.innerWidth - document.documentElement.clientWidth,
			scrollTop = window.pageYOffset,
			$content = $( '#mw-content-text' ),
			editorOptions = {
				overlayManager: overlayManager,
				currentPageHTMLParser: currentPageHTMLParser,
				fakeScroll: 0,
				api: new mw.Api(),
				licenseMsg: skin.getLicenseMsg(),
				title: page.title,
				titleObj: page.titleObj,
				isAnon: user.isAnon(),
				isNewPage: isNewPage,
				editCount: editCount,
				oldId: mw.util.getParamValue( 'oldid' ),
				contentLang: $content.attr( 'lang' ),
				contentDir: $content.attr( 'dir' ),
				sessionId: user.generateRandomSessionId()
			},
			animationDelayDeferred, abortableDataPromise, loadingOverlay, overlayPromise,
			initMechanism = mw.util.getParamValue( 'redlink' ) ? 'new' : 'click';

		if ( sectionId !== 'all' ) {
			editorOptions.sectionId = page.isWikiText() ? +sectionId : null;
		}

		function showLoading() {
			var $page, $content, $sectionTop, fakeScroll, enableVisualSectionEditing;

			$( document.body ).addClass( 've-loading' );

			$page = $( '#mw-mf-page-center' );
			$content = $( '#content' );
			if ( sectionId === '0' || sectionId === 'all' ) {
				$sectionTop = $( '#bodyContent' );
			} else {
				$sectionTop = $( '[data-section="' + sectionId + '"]' )
					.closest( 'h1, h2, h3, h4, h5, h6' );
				// When loading on action=edit URLs, there is no page content
				if ( !$sectionTop.length ) {
					$sectionTop = $( '#bodyContent' );
				}
			}
			// If there was a scrollbar that was hidden when the overlay was shown, add a margin
			// with the same width. This is mostly so that developers testing this on desktop
			// don't go crazy when the fake scroll fails to line up.
			$page.css( {
				'padding-right': '+=' + scrollbarWidth,
				'box-sizing': 'border-box'
			} );
			// Pretend that we didn't just scroll the page to the top.
			$page.prop( 'scrollTop', scrollTop );
			// Then, pretend that we're scrolling to the position of the clicked heading.
			fakeScroll = $sectionTop[0].getBoundingClientRect().top;
			// Adjust for height of the toolbar.
			fakeScroll -= 48;
			if ( shouldLoadVisualEditor() ) {
				enableVisualSectionEditing = veConfig.enableVisualSectionEditing === true ||
					// === ve.init.mw.MobileArticleTarget.static.trackingName
					veConfig.enableVisualSectionEditing === 'mobile';
				if ( sectionId === '0' || sectionId === 'all' || enableVisualSectionEditing ) {
					// Adjust for surface padding. Only needed if we're at the beginning of the doc.
					fakeScroll -= 16;
				}
			} else {
				if ( sectionId === '0' || sectionId === 'all' ) {
					fakeScroll -= 16;
				}
			}
			$content.css( {
				// Use transform instead of scroll for smoother animation (via CSS transitions).
				transform: 'translate( 0, ' + -fakeScroll + 'px )',
				// If the clicked heading is near the end of the page, we might need to insert
				// some extra space to allow us to scroll "beyond the end" of the page.
				'padding-bottom': '+=' + fakeScroll,
				'margin-bottom': '-=' + fakeScroll
			} );
			editorOptions.fakeScroll = fakeScroll;
			setTimeout( animationDelayDeferred.resolve, 500 );
		}

		function clearLoading() {
			if ( abortableDataPromise && abortableDataPromise.abort ) {
				abortableDataPromise.abort();
			}

			$( '#content' ).css( {
				transform: '',
				'padding-bottom': '',
				'margin-bottom': ''
			} );
			$( '#mw-mf-page-center' ).css( {
				'padding-right': '',
				'box-sizing': ''
			} );

			$( document.body ).removeClass( 've-loading' );
		}

		/**
		 * Log init event to edit schema.
		 * Need to log this from outside the Overlay object because that module
		 * won't have loaded yet.
		 * @private
		 * @ignore
		 * @param {string} editor name e.g. wikitext or visualeditor
		 * @method
		 */
		function logInit( editor ) {
			mw.track( 'mf.schemaEditAttemptStep', {
				action: 'init',
				type: 'section',
				mechanism: initMechanism,
				/* eslint-disable camelcase */
				editor_interface: editor,
				editing_session_id: editorOptions.sessionId
				/* eslint-enable camelcase */
			} );
		}

		/**
		 * Check whether VisualEditor should be loaded
		 * @private
		 * @ignore
		 * @method
		 * @return {bool}
		 */
		function shouldLoadVisualEditor() {
			var
				// FIXME: Should we consider default site options and user prefs?
				isVisualEditorEnabled = !!veConfig,
				preferredEditor = getPreferredEditor(),
				visualEditorNamespaces = ( veConfig && veConfig.namespaces ) || [];

			return isVisualEditorEnabled &&

				// Only for pages with a wikitext content model
				page.isWikiText() &&

				// Only in enabled namespaces
				visualEditorNamespaces.indexOf( mw.config.get( 'wgNamespaceNumber' ) ) !== -1 &&

				// Not on pages which are outputs of the Page Translation feature
				mw.config.get( 'wgTranslatePageTranslation' ) !== 'translation' &&

				(
					// If the user prefers the VisualEditor or the user has no preference and
					// the VisualEditor is the default editor for this wiki
					preferredEditor === 'VisualEditor' ||
					// We've loaded it via the URL for this request
					editorOverride === 'VisualEditor'
				) &&

				editorOverride !== 'SourceEditor';
		}

		/**
		 * Load source editor
		 * @private
		 * @ignore
		 * @method
		 * @return {jQuery.Promise} Promise resolved with the editor overlay
		 */
		function loadSourceEditor() {
			logInit( 'wikitext' );
			// Inform other interested code that we're loading the editor
			mw.hook( 'mobileFrontend.editorOpening' ).fire();

			return mw.loader.using( 'mobile.editor.overlay' ).then( function () {
				var SourceEditorOverlay = M.require( 'mobile.editor.overlay/SourceEditorOverlay' );
				return new SourceEditorOverlay( editorOptions );
			} );
		}

		/**
		 * Load visual editor. If it fails to load for any reason, load the source editor instead.
		 * @private
		 * @ignore
		 * @method
		 * @return {jQuery.Promise} Promise resolved with the editor overlay
		 */
		function loadVisualEditorMaybe() {
			logInit( 'visualeditor' );
			// Inform other interested code that we're loading the editor
			mw.hook( 'mobileFrontend.editorOpening' ).fire();

			editorOptions.mode = 'visual';
			editorOptions.dataPromise = mw.loader.using( 'ext.visualEditor.targetLoader' ).then( function () {
				abortableDataPromise = mw.libs.ve.targetLoader.requestPageData(
					editorOptions.mode,
					editorOptions.titleObj.getPrefixedDb(),
					{
						sessionStore: true,
						section: editorOptions.sectionId === undefined ?
							null : editorOptions.sectionId,
						oldId: editorOptions.oldId || undefined,
						// Should be ve.init.mw.MobileArticleTarget.static.trackingName,
						// but the class hasn't loaded yet.
						targetName: 'mobile'
					} );
				return abortableDataPromise;
			} );

			return mw.loader.using( 'ext.visualEditor.targetLoader' )
				.then( function () {
					mw.libs.ve.targetLoader.addPlugin( 'mobile.editor.ve' );
					return mw.libs.ve.targetLoader.loadModules( editorOptions.mode );
				} )
				.then( function () {
					var VisualEditorOverlay = M.require( 'mobile.editor.overlay/VisualEditorOverlay' ),
						SourceEditorOverlay = M.require( 'mobile.editor.overlay/SourceEditorOverlay' );
					editorOptions.SourceEditorOverlay = SourceEditorOverlay;
					return new VisualEditorOverlay( editorOptions );
				}, function () {
					return loadSourceEditor();
				} );
		}

		animationDelayDeferred = util.Deferred();

		// showLoading() has to run after the overlay has opened, which disables page scrolling.
		// clearLoading() has to run after the loading overlay is hidden in any way
		// (either when loading is aborted, or when the editor overlay is shown instead).
		loadingOverlay = editorLoadingOverlay( showLoading, clearLoading );

		if ( shouldLoadVisualEditor() ) {
			overlayPromise = loadVisualEditorMaybe();
		} else {
			overlayPromise = loadSourceEditor();
		}

		// Wait for the scroll animation to finish before we show the editor overlay
		util.Promise.all( [ overlayPromise, animationDelayDeferred ] ).then( function ( overlay ) {
			// Wait for the data to load before we show the editor overlay
			overlay.getLoadingPromise().then( function () {
				// Make sure the user did not close the loading overlay while we were waiting
				var overlayData = overlayManager.stack[0];
				if ( !overlayData || overlayData.overlay !== loadingOverlay ) {
					return;
				}
				// Show the editor!
				overlayManager.replaceCurrent( overlay );
			}, function ( error ) {
				// Could not load the editor.
				overlayManager.router.back();
				if ( error.show ) {
					// Probably a blockMessageDrawer returned because the user is blocked.
					error.show();
				} else {
					mw.notify( mw.msg( 'mobile-frontend-editor-error-loading' ) );
				}
			} );
		} );

		return loadingOverlay;
	} );

	$( '#ca-edit a' ).prop( 'href', function ( i, href ) {
		var uri = new mw.Uri( href );
		// By default the editor opens section 0 (lead section), rather than the whole article.
		// This might be changed in the future (T210659).
		uri.query.section = 0;
		return uri.toString();
	} );

	if ( !router.getPath() && ( mw.util.getParamValue( 'veaction' ) || mw.util.getParamValue( 'action' ) === 'edit' ) ) {
		if ( mw.util.getParamValue( 'veaction' ) === 'edit' ) {
			editorOverride = 'VisualEditor';
		} else if ( mw.util.getParamValue( 'veaction' ) === 'editsource' ) {
			editorOverride = 'SourceEditor';
		}
		// else: action=edit, for which we allow the default to take effect
		fragment = '#/editor/' + ( mw.util.getParamValue( 'section' ) || ( mw.util.getParamValue( 'action' ) === 'edit' && 'all' ) || '0' );
		// eslint-disable-next-line no-restricted-properties
		if ( window.history && history.pushState ) {
			uri = mw.Uri();
			delete uri.query.action;
			delete uri.query.veaction;
			delete uri.query.section;
			// Note: replaceState rather than pushState, because we're
			// just reformatting the URL to the equivalent-meaning for the
			// mobile site.
			history.replaceState( null, document.title, uri.toString() + fragment );
		} else {
			router.navigate( fragment );
		}
	}
}

/**
 * Hide any section id icons in the page. This will not hide the edit icon in the page action
 * menu.
 * @method
 * @ignore
 * @param {PageHTMLParser} currentPageHTMLParser
 */
function hideSectionEditIcons( currentPageHTMLParser ) {
	currentPageHTMLParser.$el.find( '.mw-editsection' ).hide();
}

/**
 * Show a drawer with log in / sign up buttons.
 * @method
 * @ignore
 * @param {Router} router
 */
function showLoginDrawer( router ) {
	var drawer = new CtaDrawer( {
		content: mw.msg( 'mobile-frontend-editor-disabled-anon' ),
		signupQueryParams: {
			warning: 'mobile-frontend-watchlist-signup-action'
		}
	} );
	$allEditLinks.on( 'click', function ( ev ) {
		drawer.show();
		ev.preventDefault();
		return drawer;
	} );
	router.route( editorPath, function () {
		drawer.show();
	} );
	router.checkRoute();
}

/**
 * Setup the editor if the user can edit the page otherwise show a sorry toast.
 * @method
 * @ignore
 * @param {Page} currentPage
 * @param {PageHTMLParser} currentPageHTMLParser
 * @param {Skin} skin
 * @param {Router} router
 */
function init( currentPage, currentPageHTMLParser, skin, router ) {
	var isReadOnly, isEditable, editErrorMessage, editRestrictions;
	// see: https://www.mediawiki.org/wiki/Manual:Interface/JavaScript#Page-specific
	isReadOnly = mw.config.get( 'wgMinervaReadOnly' );
	isEditable = !isReadOnly && mw.config.get( 'wgIsProbablyEditable' );

	if ( isEditable ) {
		// Edit button updated in setupEditor.
		setupEditor( currentPage, skin, currentPageHTMLParser, router );
	} else {
		hideSectionEditIcons( currentPageHTMLParser );
		editRestrictions = mw.config.get( 'wgRestrictionEdit' );
		if ( mw.user.isAnon() && Array.isArray( editRestrictions ) && editRestrictions.indexOf( '*' ) !== -1 ) {
			showLoginDrawer( router );
		} else {
			editErrorMessage = isReadOnly ? mw.msg( 'apierror-readonly' ) : mw.msg( 'mobile-frontend-editor-disabled' );
			showSorryToast( editErrorMessage, router );
		}
	}
}

/**
 * Wire up events that ensure we
 * show a toast message with sincere condolences when user navigates to
 * #/editor or clicks on an edit button
 * @method
 * @ignore
 * @param {string} msg Message for sorry message
 * @param {Router} router
 */
function showSorryToast( msg, router ) {
	$allEditLinks.on( 'click', function ( ev ) {
		popup.show( msg );
		ev.preventDefault();
	} );
	router.route( editorPath, function () {
		popup.show( msg );
	} );
	router.checkRoute();
}

module.exports = function ( currentPage, currentPageHTMLParser, skin ) {
	var isMissing = currentPage.id === 0,
		router = mw.loader.require( 'mediawiki.router' ),
		isEditingSupported = router.isSupported() && !blacklisted;

	if ( contentModel !== 'wikitext' ) {
		// Only load the wikitext editor on wikitext. Otherwise we'll rely on the fallback behaviour
		// (You can test this on MediaWiki:Common.css) ?action=edit url (T173800)
		return;
	}

	if ( mw.util.getParamValue( 'undo' ) ) {
		// Our fancy editor doesn't support undo, but we can rely on the fallback.
		return;
	}

	if ( !isEditingSupported ) {
		// Browser doesn't support mobile editor (or is blacklisted), use the fallback editor.
		return;
	}

	if ( currentPage.inNamespace( 'file' ) && isMissing ) {
		// Is a new file page (enable upload image only) Bug 58311
		showSorryToast( mw.msg( 'mobile-frontend-editor-uploadenable' ), router );
	} else {
		// Edit button is currently hidden. A call to init() will update it as needed.
		init( currentPage, currentPageHTMLParser, skin, router );
	}
};
