/* global jQuery */
( function ( M, $ ) {

	var
		router = require( 'mediawiki.router' ),
		OverlayManager = M.require( 'mobile.startup/OverlayManager' ),
		overlayManager = OverlayManager.getSingleton(),
		loader = M.require( 'mobile.startup/rlModuleLoader' ),
		skin = M.require( 'mobile.init/skin' ),
		currentPage = M.getCurrentPage(),
		// #ca-edit, .mw-editsection are standard MediaWiki elements
		// .edit-link comes from MobileFrontend user page creation CTA
		$allEditLinks = $( '#ca-edit a, .mw-editsection a, .edit-link' ),
		user = mw.user,
		popup = M.require( 'mobile.startup/toast' ),
		CtaDrawer = M.require( 'mobile.startup/CtaDrawer' ),
		// FIXME: Disable on IE < 10 for time being
		blacklisted = /MSIE \d\./.test( navigator.userAgent ),
		contentModel = mw.config.get( 'wgPageContentModel' ),
		isEditingSupported = router.isSupported() && !blacklisted,
		// FIXME: Use currentPage.getId()
		isNewPage = currentPage.options.id === 0,
		isNewFile = currentPage.inNamespace( 'file' ) && isNewPage,
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
			// For now, we are going to ignore which editor is set as the default for the
			// wiki and always default to the source editor. Once we decide to honor the
			// default editor setting for the wiki, we'll want to use:
			// visualEditorDefault = veConfig && veConfig.defaultUserOptions &&
			//   veConfig.defaultUserOptions.enable;
			// return visualEditorDefault ? 'VisualEditor' : 'SourceEditor';
			return 'SourceEditor';
		}
		return preferredEditor;
	}

	/**
	 * Initialize the edit button so that it launches the editor interface when clicked.
	 * @method
	 * @ignore
	 * @param {Page} page The page to edit.
	 */
	function setupEditor( page ) {
		var uri, fragment, editorOverride, section,
			isNewPage = page.options.id === 0,
			leadSection = page.getLeadSectionElement();

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
					isAnon: user.isAnon(),
					isNewPage: isNewPage,
					editCount: editCount,
					oldId: mw.util.getParamValue( 'oldid' ),
					contentLang: $content.attr( 'lang' ),
					contentDir: $content.attr( 'dir' ),
					sessionId: user.generateRandomSessionId()
				},
				visualEditorNamespaces = veConfig && veConfig.namespaces,
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
				$.inArray( mw.config.get( 'wgNamespaceNumber' ), visualEditorNamespaces ) > -1 &&

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
				return loader.loadModule( 'mobile.editor.ve' ).then( function () {
					var VisualEditorOverlay = M.require( 'mobile.editor.ve/VisualEditorOverlay' );
					return new VisualEditorOverlay( editorOptions );
				}, loadSourceEditor );
			} else {
				return loadSourceEditor();
			}
		} );

		// By default the editor opens section 0 (lead section). If lead section is empty, and
		// there are sections on the page, open editor with section 1 instead.
		// (Be careful not to do this when leadSection is null, as this means MobileFormatter
		// has not been run and thus we could not identify the lead.)
		section = 0;
		if ( leadSection && !leadSection.text() && !isNewPage && page.getSections().length !== 0 ) {
			section = 1;
		}
		$( '#ca-edit a' ).prop( 'href', function ( i, href ) {
			var uri = new mw.Uri( href );
			uri.query.section = section;
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
	 */
	function hideSectionEditIcons() {
		currentPage.$( '.mw-editsection' ).hide();
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
	 */
	function init() {
		var isReadOnly, isEditable, editErrorMessage, editRestrictions;
		// see: https://www.mediawiki.org/wiki/Manual:Interface/JavaScript#Page-specific
		isReadOnly = mw.config.get( 'wgMinervaReadOnly' );
		isEditable = !isReadOnly && mw.config.get( 'wgIsProbablyEditable' );

		if ( isEditable ) {
			// Edit button updated in setupEditor.
			setupEditor( currentPage );
		} else {
			hideSectionEditIcons();
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

	if ( isNewFile ) {
		// Is a new file page (enable upload image only) Bug 58311
		showSorryToast( mw.msg( 'mobile-frontend-editor-uploadenable' ) );
	} else {
		// Edit button is currently hidden. A call to init() will update it as needed.
		init();
	}
}( mw.mobileFrontend, jQuery ) );
