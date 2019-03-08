/* global $ */
var M = require( '../mobile.startup/moduleLoaderSingleton' ),
	router = mw.loader.require( 'mediawiki.router' ),
	OverlayManager = require( '../mobile.startup/OverlayManager' ),
	overlayManager = OverlayManager.getSingleton(),
	loader = require( '../mobile.startup/rlModuleLoader' ),
	// #ca-edit, .mw-editsection are standard MediaWiki elements
	// .edit-link comes from MobileFrontend user page creation CTA
	// TODO: T213352 replace "#ca-edit a, a#ca-edit" with just "#ca-edit" when
	// cache clears and new page actions menu is served.
	$allEditLinks = $( '#ca-edit a, a#ca-edit, .mw-editsection a, .edit-link' ),
	user = mw.user,
	popup = require( '../mobile.startup/toast' ),
	CtaDrawer = require( '../mobile.startup/CtaDrawer' ),
	// FIXME: Disable on IE < 10 for time being
	blacklisted = /MSIE \d\./.test( navigator.userAgent ),
	contentModel = mw.config.get( 'wgPageContentModel' ),
	isEditingSupported = router.isSupported() && !blacklisted,
	veConfig = mw.config.get( 'wgVisualEditorConfig' ),
	editCount = mw.config.get( 'wgUserEditCount' ),
	// FIXME: Should we consider default site options and user prefs?
	isVisualEditorEnabled = veConfig,
	editorPath = /^\/editor\/(\d+|all)$/;

/**
 * Event handler for edit link clicks. Will prevent default link
 * behaviour and will not allow propagation
 * @method
 * @ignore
 * @return {boolean}
 */
function onEditLinkClick() {
	var section = ( new mw.Uri( this.href ) ).query.section || 'all';
	router.navigate( '#/editor/' + section );
	// prevent folding section when clicking Edit by stopping propagation
	return false;
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
	if ( !preferredEditor ) {
		return mw.config.get( 'wgMFUsePreferredEditor' ) && mw.user.options.get( 'visualeditor-editor' ) === 'visualeditor' ?
			'VisualEditor' : 'SourceEditor';
	}
	return preferredEditor;
}

/**
 * Initialize the edit button so that it launches the editor interface when clicked.
 * @method
 * @ignore
 * @param {Page} page The page to edit.
 * @param {Skin} skin
 */
function setupEditor( page, skin ) {
	var uri, fragment, editorOverride,
		isNewPage = page.options.id === 0;

	$allEditLinks.on( 'click', onEditLinkClick );
	overlayManager.add( editorPath, function ( sectionId ) {
		var
			$content = $( '#mw-content-text' ),
			preferredEditor = getPreferredEditor(),
			editorOptions = {
				overlayManager: overlayManager,
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
			loadingOverlay,
			visualEditorNamespaces = ( veConfig && veConfig.namespaces ) || [],
			initMechanism = mw.util.getParamValue( 'redlink' ) ? 'new' : 'click';

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
		 * Load source editor
		 * @private
		 * @ignore
		 * @method
		 * @return {jQuery.Promise}
		 */
		function loadSourceEditor() {
			logInit( 'wikitext' );
			// Inform other interested code that we're loading the editor
			mw.hook( 'mobileFrontend.editorOpening' ).fire();

			return loader.loadModule( 'mobile.editor.overlay' ).then( function () {
				var EditorOverlay = M.require( 'mobile.editor.overlay/EditorOverlay' );
				return new EditorOverlay( editorOptions );
			} );
		}

		if ( sectionId !== 'all' ) {
			editorOptions.sectionId = page.isWikiText() ? +sectionId : null;
		}

		// Check whether VisualEditor should be loaded
		if ( isVisualEditorEnabled &&

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

			editorOverride !== 'SourceEditor'
		) {
			logInit( 'visualeditor' );
			// Inform other interested code that we're loading the editor
			mw.hook( 'mobileFrontend.editorOpening' ).fire();

			// Display an overlay identical to loader.loadModule( ... )
			loadingOverlay = loader.newLoadingOverlay();
			loadingOverlay.appendTo( document.body );
			loadingOverlay.show();

			editorOptions.mode = 'visual';
			editorOptions.dataPromise = mw.loader.using( 'ext.visualEditor.targetLoader' ).then( function () {
				return mw.libs.ve.targetLoader.requestPageData(
					editorOptions.mode,
					editorOptions.titleObj.getPrefixedDb(),
					{
						sessionStore: true,
						section: editorOptions.sectionId || null,
						oldId: editorOptions.oldId || undefined,
						// Should be ve.init.mw.MobileFrontendArticleTarget.static.trackingName,
						// but the class hasn't loaded yet.
						targetName: 'mobile'
					} );
			} );
			return mw.loader.using( 'ext.visualEditor.targetLoader' ).then( function () {
				mw.libs.ve.targetLoader.addPlugin( 'mobile.editor.ve' );
				return mw.libs.ve.targetLoader.loadModules( editorOptions.mode );
			} ).then( function () {
				var VisualEditorOverlay = M.require( 'mobile.editor.overlay/VisualEditorOverlay' ),
					EditorOverlay = M.require( 'mobile.editor.overlay/EditorOverlay' );
				editorOptions.EditorOverlay = EditorOverlay;
				loadingOverlay.hide();
				return new VisualEditorOverlay( editorOptions );
			}, function () {
				loadingOverlay.hide();
				return loadSourceEditor();
			} );
		} else {
			return loadSourceEditor();
		}
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
 * @param {Page} currentPage
 */
function hideSectionEditIcons( currentPage ) {
	currentPage.$el.find( '.mw-editsection' ).hide();
}

/**
 * Show a drawer with log in / sign up buttons.
 * @method
 * @ignore
 */
function showLoginDrawer() {
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
 * @param {Skin} skin
 */
function init( currentPage, skin ) {
	var isReadOnly, isEditable, editErrorMessage, editRestrictions;
	// see: https://www.mediawiki.org/wiki/Manual:Interface/JavaScript#Page-specific
	isReadOnly = mw.config.get( 'wgMinervaReadOnly' );
	isEditable = !isReadOnly && mw.config.get( 'wgIsProbablyEditable' );

	if ( isEditable ) {
		// Edit button updated in setupEditor.
		setupEditor( currentPage, skin );
	} else {
		hideSectionEditIcons( currentPage );
		editRestrictions = mw.config.get( 'wgRestrictionEdit' );
		if ( mw.user.isAnon() && Array.isArray( editRestrictions ) && editRestrictions.indexOf( '*' ) !== -1 ) {
			showLoginDrawer();
		} else {
			editErrorMessage = isReadOnly ? mw.msg( 'apierror-readonly' ) : mw.msg( 'mobile-frontend-editor-disabled' );
			showSorryToast( editErrorMessage );
		}
	}
}

/**
 * Show a toast message with sincere condolences.
 * @method
 * @ignore
 * @param {string} msg Message for sorry message
 */
function showSorryToast( msg ) {
	$allEditLinks.on( 'click', function ( ev ) {
		popup.show( msg );
		ev.preventDefault();
	} );
	router.route( editorPath, function () {
		popup.show( msg );
	} );
	router.checkRoute();
}

module.exports = function ( currentPage, skin ) {
	var isMissing = currentPage.options.id === 0;
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
		showSorryToast( mw.msg( 'mobile-frontend-editor-uploadenable' ) );
	} else {
		// Edit button is currently hidden. A call to init() will update it as needed.
		init( currentPage, skin );
	}
};
