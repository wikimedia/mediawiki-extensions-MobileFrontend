/* global $ */
var M = require( '../mobile.startup/moduleLoaderSingleton' ),
	util = require( '../mobile.startup/util' ),
	editorLoadingOverlay = require( './editorLoadingOverlay' ),
	OverlayManager = require( '../mobile.startup/OverlayManager' ),
	// #ca-edit, .mw-editsection are standard MediaWiki elements
	// .edit-link can be added to links anywhere to trigger the editor (e.g. MobileFrontend
	// user page creation CTA, edit-full-page overflow menu item)
	// Links in content are handled separately to allow reloading the content (T324686)
	$editTab = $( '#ca-edit, #ca-editsource, #ca-viewsource, #ca-ve-edit, #ca-ve-create, #ca-createsource' ),
	hasTwoEditIcons = $editTab.length > 1,
	editorOverride = null,
	EDITSECTION_SELECTOR = '.mw-editsection a, .edit-link',
	user = mw.user,
	CtaDrawer = require( '../mobile.startup/CtaDrawer' ),
	veConfig = mw.config.get( 'wgVisualEditorConfig' ),
	editorPath = /^\/editor\/(\d+|T-\d+|all)$/;

/**
 * Event handler for edit link clicks. Will prevent default link
 * behaviour and will not allow propagation
 *
 * @method
 * @ignore
 * @param {HTMLElement} elem
 * @param {jQuery.Event} ev
 * @param {Router} router
 */
function onEditLinkClick( elem, ev, router ) {
	var section;
	if ( $( EDITSECTION_SELECTOR ).length === 0 ) {
		// If section edit links are not available, the only edit link
		// should allow editing the whole page (T232170)
		section = 'all';
	} else {
		section = mw.util.getParamValue( 'section', elem.href ) || 'all';
	}
	// Don't do anything for section edit links for different pages (transcluded)
	if ( mw.config.get( 'wgPageName' ) !== mw.util.getParamValue( 'title', elem.href ) ) {
		return;
	}
	if ( hasTwoEditIcons ) {
		if ( elem.id === 'ca-ve-edit' || elem.id === 'ca-ve-create' ) {
			// "Edit" tab loads the visual editor
			editorOverride = 'VisualEditor';
		} else if ( elem.id === 'ca-editsource' || elem.id === 'ca-createsource' ) {
			// "Edit source" tab loads the source editor
			editorOverride = 'SourceEditor';
		} else {
			// Any other edit links (e.g. for sections) load the preferred editor
		}
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
 *
 * @method
 * @ignore
 * @return {string} Either 'VisualEditor' or 'SourceEditor'
 */
function getPreferredEditor() {
	if ( editorOverride ) {
		// Temporary override, set via the URL for this request
		// or by clicking the chosen mode when both tabs are shown
		return editorOverride;
	}
	const preferredEditor = mw.user.options.get( 'mobile-editor' ) || mw.storage.get( 'preferredEditor' );
	if ( preferredEditor ) {
		return preferredEditor;
	}
	const defaultEditor = mw.config.get( 'wgMFDefaultEditor' );
	switch ( defaultEditor ) {
		case 'source':
			return 'SourceEditor';
		case 'visual':
			return 'VisualEditor';
		case 'preference':
			// First check if the user has actually used the desktop editor.
			// This is done hackily by checking if they have the preference
			// set to suppress the welcome dialog or user education popups. (T261423)
			if ( mw.user.options.get( 'visualeditor-hidebetawelcome' ) || mw.user.options.get( 'visualeditor-hideusered' ) ) {
				return mw.user.options.get( 'visualeditor-editor' ) === 'visualeditor' ? 'VisualEditor' : 'SourceEditor';
			} else {
				// We don't know what their preference is.
				// For now, continue to give them the source editor.
				return 'SourceEditor';
			}
	}
	// In the event of misconfiguration, fall back to source
	return 'SourceEditor';
}

/**
 * Initialize the edit button so that it launches the editor interface when clicked.
 *
 * @method
 * @ignore
 * @param {Page} page The page to edit.
 * @param {Skin} skin
 * @param {PageHTMLParser} currentPageHTMLParser
 * @param {Router} router
 */
function setupEditor( page, skin, currentPageHTMLParser, router ) {
	var
		overlayManager = OverlayManager.getSingleton(),
		isNewPage = page.id === 0;

	$editTab.add( '.edit-link' ).on( 'click.mfeditlink', function ( ev ) {
		onEditLinkClick( this, ev, overlayManager.router );
	} );
	mw.hook( 'wikipage.content' ).add( function ( $content ) {
		// make sure that any .edit-link links in here don't get double-handled
		$content.find( EDITSECTION_SELECTOR ).off( 'click.mfeditlink' ).on( 'click.mfeditlink', function ( ev ) {
			onEditLinkClick( this, ev, overlayManager.router );
		} );
	} );

	overlayManager.add( editorPath, function ( sectionId ) {
		var
			scrollTop = window.pageYOffset,
			$contentText = $( '#mw-content-text' ),
			url = new URL( location.href ),
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
				oldId: mw.util.getParamValue( 'oldid' ),
				contentLang: $contentText.attr( 'lang' ),
				contentDir: $contentText.attr( 'dir' ),
				// Arrange preload content if we're on a page with those URL parameters
				preload: url.searchParams.get( 'preload' ),
				preloadparams: mw.util.getArrayParam( 'preloadparams', url.searchParams ),
				editintro: url.searchParams.get( 'editintro' )
			},
			visualAbortPromise = $.Deferred(),
			animationDelayDeferred, abortableDataPromise, loadingOverlay, overlayPromise,
			initMechanism = mw.util.getParamValue( 'redlink' ) ? 'new' : 'click';

		if ( sectionId !== 'all' ) {
			editorOptions.sectionId = page.isWikiText() ? sectionId : undefined;
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

			$( document.body ).removeClass( 've-loading' );
		}

		function loadBasicEditor() {
			// Note that this option was used when logging a wikitext init later
			initMechanism = 'tooslow';

			// This restarts the loading (whether it was aborted when loading the code or the data)
			visualAbortPromise.reject();
			if ( abortableDataPromise && abortableDataPromise.abort ) {
				abortableDataPromise.abort();
			}
		}

		/**
		 * Log init event to edit schema.
		 * Need to log this from outside the Overlay object because that module
		 * won't have loaded yet.
		 *
		 * @private
		 * @ignore
		 * @param {string} editor name e.g. wikitext or visualeditor
		 * @method
		 */
		function logInit( editor ) {
			mw.track( 'editAttemptStep', {
				action: 'init',
				type: 'section',
				mechanism: initMechanism,
				integration: 'page',
				/* eslint-disable camelcase */
				editor_interface: editor
				/* eslint-enable camelcase */
			} );
		}

		/**
		 * Check whether VisualEditor should be loaded
		 *
		 * @private
		 * @ignore
		 * @method
		 * @return {bool}
		 */
		function shouldLoadVisualEditor() {
			var preferredEditor = getPreferredEditor();

			return page.isVESourceAvailable() || (
				page.isVEVisualAvailable() &&
				// If the user prefers visual mode or the user has no preference and
				// the visual mode is the default editor for this wiki
				preferredEditor === 'VisualEditor'
			);
		}

		/**
		 * Load source editor
		 *
		 * @private
		 * @ignore
		 * @method
		 * @return {jQuery.Promise} Promise resolved with the editor overlay
		 * @fires mobileFrontend.editorOpening
		 */
		function loadSourceEditor() {
			logInit( 'wikitext' );
			// Inform other interested code that we're loading the editor
			/**
			 * @event mobileFrontend.editorOpening
			 * @internal for use in GrowthExperiments only.
			 */
			mw.hook( 'mobileFrontend.editorOpening' ).fire();

			return mw.loader.using( 'mobile.editor.overlay' ).then( function () {
				var SourceEditorOverlay = M.require( 'mobile.editor.overlay/SourceEditorOverlay' );
				return new SourceEditorOverlay( editorOptions );
			} );
		}

		/**
		 * Load visual editor. If it fails to load for any reason, load the source editor instead.
		 *
		 * @private
		 * @ignore
		 * @method
		 * @return {jQuery.Promise} Promise resolved with the editor overlay
		 */
		function loadVisualEditorMaybe() {
			logInit( 'visualeditor' );
			// Inform other interested code that we're loading the editor
			/**
			 * @event mobileFrontend.editorOpening
			 * @internal for use in GrowthExperiments only.
			 */
			mw.hook( 'mobileFrontend.editorOpening' ).fire();

			editorOptions.mode = mw.config.get( 'wgMFEnableVEWikitextEditor' ) && getPreferredEditor() === 'SourceEditor' ?
				'source' :
				'visual';
			editorOptions.dataPromise = mw.loader.using( 'ext.visualEditor.targetLoader' ).then( function () {
				abortableDataPromise = mw.libs.ve.targetLoader.requestPageData(
					editorOptions.mode,
					editorOptions.titleObj.getPrefixedDb(),
					{
						sessionStore: true,
						section: editorOptions.sectionId === undefined ?
							null : editorOptions.sectionId,
						oldId: editorOptions.oldId || undefined,
						preload: editorOptions.preload,
						preloadparams: editorOptions.preloadparams,
						editintro: editorOptions.editintro,
						// Should be ve.init.mw.MobileArticleTarget.static.trackingName,
						// but the class hasn't loaded yet.
						targetName: 'mobile'
					} );
				return abortableDataPromise;
			} );

			var visualLoadingPromise = mw.loader.using( 'ext.visualEditor.targetLoader' )
				.then( function () {
					// Load 'mobile.editor.overlay' separately, so that if we fall back to basic
					// editor, we can display it without waiting for the visual code
					return mw.loader.using( 'mobile.editor.overlay' ).then( function () {
						mw.libs.ve.targetLoader.addPlugin( 'ext.visualEditor.mobileArticleTarget' );
						if ( mw.config.get( 'wgMFEnableVEWikitextEditor' ) ) {
							// Target loader only loads wikitext editor if the desktop
							// preference is set.
							// TODO: Have a cleaner API for this instead of duplicating
							// the module name here.
							mw.libs.ve.targetLoader.addPlugin( 'ext.visualEditor.mwwikitext' );
						}
						return mw.libs.ve.targetLoader.loadModules( editorOptions.mode );
					} );
				} );

			// Continue when loading is completed or aborted
			var visualPromise = $.Deferred();
			visualLoadingPromise.then( visualPromise.resolve, visualPromise.reject );
			visualAbortPromise.then( visualPromise.reject, visualPromise.reject );

			return visualPromise
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
		loadingOverlay = editorLoadingOverlay( showLoading, clearLoading,
			shouldLoadVisualEditor() ? loadBasicEditor : null );

		if ( shouldLoadVisualEditor() ) {
			overlayPromise = loadVisualEditorMaybe();
		} else {
			overlayPromise = loadSourceEditor();
		}

		// Wait for the scroll animation to finish before we show the editor overlay
		util.Promise.all( [ overlayPromise, animationDelayDeferred ] ).then( function ( overlay ) {
			// Wait for the data to load before we show the editor overlay
			overlay.getLoadingPromise().catch( function ( error ) {
				if ( visualAbortPromise.state() === 'rejected' ) {
					return loadSourceEditor().then( function ( sourceOverlay ) {
						overlay = sourceOverlay;
						return overlay.getLoadingPromise();
					} );
				}
				return $.Deferred().reject( error ).promise();
			} ).then( function () {
				// Make sure the user did not close the loading overlay while we were waiting
				var overlayData = overlayManager.stack[0];
				if ( !overlayData || overlayData.overlay !== loadingOverlay ) {
					return;
				}
				// Show the editor!
				overlayManager.replaceCurrent( overlay );
			}, function ( error, apiResponse ) {
				// Could not load the editor.
				overlayManager.router.back();
				if ( error.show ) {
					// Probably a blockMessageDrawer returned because the user is blocked.
					document.body.appendChild( error.$el[ 0 ] );
					error.show();
				} else if ( apiResponse ) {
					mw.notify( editorOptions.api.getErrorMessage( apiResponse ) );
				} else {
					mw.notify( mw.msg( 'mobile-frontend-editor-error-loading' ) );
				}
			} );
		} );

		// Reset the temporary override for the next load
		editorOverride = null;

		return loadingOverlay;
	} );

	$( '#ca-edit a, a#ca-edit, #ca-editsource a, a#ca-editsource' ).prop( 'href', function ( i, href ) {
		const editUrl = new URL( href, location.href );
		// By default the editor opens section 0 (lead section), rather than the whole article.
		// This might be changed in the future (T210659).
		editUrl.searchParams.set( 'section', '0' );
		return editUrl.toString();
	} );

	// We use wgAction instead of getParamValue('action') as the former can be
	// overridden by hooks to stop the editor loading automatically.
	if ( !router.getPath() && ( mw.util.getParamValue( 'veaction' ) || mw.config.get( 'wgAction' ) === 'edit' ) ) {
		if ( mw.util.getParamValue( 'veaction' ) === 'edit' ) {
			editorOverride = 'VisualEditor';
		} else if ( mw.util.getParamValue( 'veaction' ) === 'editsource' ) {
			editorOverride = 'SourceEditor';
		}
		// else: action=edit, for which we allow the default to take effect
		const fragment = '#/editor/' + ( mw.util.getParamValue( 'section' ) || ( mw.config.get( 'wgAction' ) === 'edit' ? 'all' : '0' ) );
		// eslint-disable-next-line no-restricted-properties
		if ( window.history && history.pushState ) {
			// We're reformatting the action=edit URL into a view URL and
			// replacing it into the history, and then will fall through to
			// router.navigate which will move us to the editing URL for the
			// mobile site. We do this because the editor overlay deeply
			// expects to have been opened on top of an actual page, and e.g.
			// closing the editor via the X will produce unexpected behavior
			// otherwise.
			const url = new URL( location.href );
			url.searchParams.delete( 'action' );
			url.searchParams.delete( 'veaction' );
			url.searchParams.delete( 'section' );
			history.replaceState( null, document.title, url );
		}
		util.docReady( function () {
			router.navigate( fragment );
		} );
	}
}

/**
 * Hide any section id icons in the page. This will not hide the edit icon in the page action
 * menu.
 *
 * @method
 * @ignore
 * @param {PageHTMLParser} currentPageHTMLParser
 */
function hideSectionEditIcons( currentPageHTMLParser ) {
	currentPageHTMLParser.$el.find( '.mw-editsection' ).hide();
}

/**
 * Show a drawer with log in / sign up buttons.
 *
 * @method
 * @ignore
 * @param {Router} router
 */
function bindEditLinksLoginDrawer( router ) {
	var drawer;
	function showLoginDrawer() {
		if ( !drawer ) {
			drawer = new CtaDrawer( {
				content: mw.msg( 'mobile-frontend-editor-disabled-anon' ),
				signupQueryParams: {
					warning: 'mobile-frontend-watchlist-signup-action'
				}
			} );
			document.body.appendChild( drawer.$el[ 0 ] );
		}
		drawer.show();
	}
	$editTab.on( 'click', function ( ev ) {
		showLoginDrawer();
		ev.preventDefault();
	} );
	mw.hook( 'wikipage.content' ).add( function ( $content ) {
		$content.find( EDITSECTION_SELECTOR ).on( 'click', function ( ev ) {
			showLoginDrawer();
			ev.preventDefault();
		} );
	} );
	router.route( editorPath, function () {
		showLoginDrawer();
	} );
	router.checkRoute();
}

/**
 * Setup the editor if the user can edit the page otherwise show a sorry toast.
 *
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
		if ( mw.user.isAnon() && Array.isArray( editRestrictions ) && !editRestrictions.length ) {
			bindEditLinksLoginDrawer( router );
		} else {
			var $link = $( '<a>' ).attr( 'href', '/wiki/' + mw.config.get( 'wgPageName' ) + '?action=edit' );
			editErrorMessage = isReadOnly ? mw.msg( 'apierror-readonly' ) : mw.message( 'mobile-frontend-editor-disabled', $link ).parseDom();
			bindEditLinksSorryToast( editErrorMessage, router );
		}
	}
}

/**
 * Wire up events that ensure we
 * show a toast message with sincere condolences when user navigates to
 * #/editor or clicks on an edit button
 *
 * @method
 * @ignore
 * @param {string} msg Message for sorry message
 * @param {Router} router
 */
function bindEditLinksSorryToast( msg, router ) {
	$editTab.on( 'click', function ( ev ) {
		mw.notify( msg );
		ev.preventDefault();
	} );
	mw.hook( 'wikipage.content' ).add( function ( $content ) {
		$content.find( EDITSECTION_SELECTOR ).on( 'click', function ( ev ) {
			mw.notify( msg );
			ev.preventDefault();
		} );
	} );
	router.route( editorPath, function () {
		mw.notify( msg );
	} );
	router.checkRoute();
}

module.exports = function ( currentPage, currentPageHTMLParser, skin ) {
	var router = mw.loader.require( 'mediawiki.router' );

	if ( currentPage.inNamespace( 'file' ) && currentPage.id === 0 ) {
		// Is a new file page (enable upload image only) T60311
		bindEditLinksSorryToast( mw.msg( 'mobile-frontend-editor-uploadenable' ), router );
	} else {
		// Edit button is currently hidden. A call to init() will update it as needed.
		init( currentPage, currentPageHTMLParser, skin, router );
	}
};
