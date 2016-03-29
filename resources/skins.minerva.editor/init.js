( function ( M, $ ) {

	var
		// see: https://www.mediawiki.org/wiki/Manual:Interface/JavaScript#Page-specific
		isEditable = mw.config.get( 'wgIsProbablyEditable' ),
		blockInfo =  mw.config.get( 'wgMinervaUserBlockInfo', false ),
		settings = M.require( 'mobile.settings/settings' ),
		router = M.require( 'mobile.startup/router' ),
		overlayManager = M.require( 'mobile.startup/overlayManager' ),
		loader = M.require( 'mobile.overlays/moduleLoader' ),
		Icon = M.require( 'mobile.startup/Icon' ),
		Button = M.require( 'mobile.startup/Button' ),
		Anchor = M.require( 'mobile.startup/Anchor' ),
		skin = M.require( 'skins.minerva.scripts/skin' ),
		browser = M.require( 'mobile.browser/browser' ),
		disabledEditIcon = new Icon( {
			name: 'edit'
		} ),
		enabledEditIcon = new Icon( {
			name: 'edit-enabled'
		} ),
		currentPage = M.getCurrentPage(),
		enabledClass = enabledEditIcon.getGlyphClassName(),
		disabledClass = disabledEditIcon.getGlyphClassName(),
		context = M.require( 'mobile.context/context' ),
		user = M.require( 'mobile.user/user' ),
		popup = M.require( 'mobile.toast/toast' ),
		// FIXME: Disable on IE < 10 for time being
		blacklisted = /MSIE \d\./.test( navigator.userAgent ),
		isEditingSupported = router.isSupported() && !blacklisted,
		// FIXME: Use currentPage.getId()
		isNewPage = currentPage.options.id === 0,
		isNewFile = currentPage.inNamespace( 'file' ) && isNewPage,
		veConfig = mw.config.get( 'wgVisualEditorConfig' ),
		// FIXME: Should we consider default site options and user prefs?
		isVisualEditorEnabled = veConfig,
		CtaDrawer = M.require( 'mobile.drawers/CtaDrawer' ),
		drawer,
		$caEdit = $( '#ca-edit' );

	if ( user.isAnon() ) {
		blockInfo = false;
	} else if ( isEditable ) {
		// for logged in users check if they are blocked from editing this page
		isEditable = !blockInfo;
	}
	/**
	 * Prepend an edit page button to the container
	 * @method
	 * @ignore
	 * @param {Number} section number
	 * @param {String} container CSS selector of the container
	 * @returns {jQuery.Object} newly created edit page button
	 */
	function addEditButton( section, container ) {
		return $( '<a class="edit-page">' )
			.attr( {
				href: '#/editor/' + section,
				title: $( container ).attr( 'title' )
			} )
			.text( mw.msg( 'mobile-frontend-editor-edit' ) )
			.prependTo( container );
	}

	/**
	 * Make an element render a CTA when clicked
	 * @method
	 * @ignore
	 * @param {jQuery.Object} $el Element which will render a drawer on click
	 * @param {Number} section number representing the section
	 */
	function makeCta( $el, section ) {
		$el
			.on( 'click', function ( ev ) {
				ev.preventDefault();
				// prevent folding section when clicking Edit
				ev.stopPropagation();
				// need to use toggle() because we do ev.stopPropagation() (in addEditButton())
				if ( !drawer ) {
					drawer = new CtaDrawer( {
						queryParams: {
							returnto: mw.config.get( 'wgPageName' ),
							returntoquery: 'action=edit&section=' + section,
							warning: 'mobile-frontend-edit-login-action',
							campaign: 'mobile_editPageActionCta'
						},
						signupQueryParams: {
							returntoquery: 'article_action=signup-edit',
							warning: 'mobile-frontend-edit-signup-action'
						},
						content: mw.msg( 'mobile-frontend-editor-cta' )
					} );
				}
				drawer
					.toggle();
			} )
			// needed until we use tap everywhere to prevent the link from being followed
			.on( 'click', false );
	}

	/**
	 * Retrieve the user's preferred editor setting. If none is set, return the default
	 * editor for this wiki.
	 * @method
	 * @ignore
	 * @return {String} Either 'VisualEditor' or 'SourceEditor'
	 */
	function getPreferredEditor() {
		var preferredEditor = settings.get( 'preferredEditor', true );
		if ( preferredEditor === null ) {
			// For now, we are going to ignore which editor is set as the default for the
			// wiki and always default to the source editor. Once we decide to honor the
			// default editor setting for the wiki, we'll want to use:
			// visualEditorDefault = veConfig && veConfig.defaultUserOptions && veConfig.defaultUserOptions.enable;
			// return visualEditorDefault ? 'VisualEditor' : 'SourceEditor';
			return 'SourceEditor';
		} else {
			return preferredEditor;
		}
	}

	/**
	 * Initialize the edit button so that it launches the editor interface when clicked.
	 * @method
	 * @ignore
	 * @param {Page} page The page to edit.
	 */
	function setupEditor( page ) {
		var isNewPage = page.options.id === 0;

		if ( mw.util.getParamValue( 'undo' ) ) {
			window.alert( mw.msg( 'mobile-frontend-editor-undo-unsupported' ) );
		}

		page.$( '.edit-page' ).on( 'click', function () {
			router.navigate( '#/editor/' + $( this ).data( 'section' ) );
			return false;
		} );
		overlayManager.add( /^\/editor\/(\d+)$/, function ( sectionId ) {
			var
				$content = $( '#mw-content-text' ),
				result = $.Deferred(),
				preferredEditor = getPreferredEditor(),
				editorOptions = {
					api: new mw.Api(),
					licenseMsg: skin.getLicenseMsg(),
					title: page.title,
					isAnon: user.isAnon(),
					isNewPage: isNewPage,
					isNewEditor: user.getEditCount() === 0,
					oldId: mw.util.getParamValue( 'oldid' ),
					contentLang: $content.attr( 'lang' ),
					contentDir: $content.attr( 'dir' ),
					sessionId: mw.user.generateRandomSessionId()
				},
				visualEditorNamespaces = veConfig && veConfig.namespaces,
				initMechanism = mw.util.getParamValue( 'redlink' ) ? 'new' : 'click';

			/**
			 * Log init event to edit schema.
			 * Need to log this from outside the Overlay object because that module
			 * won't have loaded yet.
			 * @private
			 * @ignore
			 * @param {String} editor name e.g. wikitext or visualeditor
			 * @method
			 */
			function logInit( editor ) {
				mw.track( 'mf.schemaEdit', {
					action: 'init',
					type: 'section',
					mechanism: initMechanism,
					editor: editor,
					editingSessionId: editorOptions.sessionId
				} );
			}
			/**
			 * Load source editor
			 * @private
			 * @ignore
			 * @method
			 */
			function loadSourceEditor() {
				var rlModuleName, moduleName;

				logInit( 'wikitext' );

				// use the new wikitexteditor with a basic toolbar as a test for beta users and users
				// without an iphone (bottom toolbars doesn't work) - Bug T109224
				// FIXME: Make this working with iOS8
				if ( !user.inUserBucketA() && context.isBetaGroupMember() && !browser.isIos( 8 ) ) {
					moduleName = 'mobile.editor.overlay.withtoolbar/EditorOverlayWithToolbar';
					rlModuleName = 'mobile.editor.overlay.withtoolbar';
				} else {
					moduleName = 'mobile.editor.overlay/EditorOverlay';
					rlModuleName = 'mobile.editor.overlay';
				}
				loader.loadModule( rlModuleName ).done( function () {
					var EditorOverlay = M.require( moduleName );
					result.resolve( new EditorOverlay( editorOptions ) );
				} );
			}

			editorOptions.sectionId = page.isWikiText() ? parseInt( sectionId, 10 ) : null;

			// Check whether VisualEditor should be loaded
			if ( isVisualEditorEnabled &&

				// Only for pages with a wikitext content model
				page.isWikiText() &&

				// Only in enabled namespaces
				$.inArray( mw.config.get( 'wgNamespaceNumber' ), visualEditorNamespaces ) > -1 &&

				// Not on pages which are outputs of the Page Translation feature
				mw.config.get( 'wgTranslatePageTranslation' ) !== 'translation' &&

				// If the user prefers the VisualEditor or the user has no preference and
				// the VisualEditor is the default editor for this wiki
				preferredEditor === 'VisualEditor'
			) {
				logInit( 'visualeditor' );
				loader.loadModule( 'mobile.editor.ve' ).done( function () {
					var VisualEditorOverlay = M.require( 'mobile.editor.ve/VisualEditorOverlay' );
					result.resolve( new VisualEditorOverlay( editorOptions ) );
				} ).fail( loadSourceEditor );
			} else {
				loadSourceEditor();
			}

			return result;
		} );
		$caEdit.addClass( enabledClass ).removeClass( disabledClass ).removeClass( 'hidden' );

		currentPage.getRedLinks().on( 'click', function ( ev ) {
			var drawerOptions = {
					progressiveButton: new Button( {
						progressive: true,
						label: mw.msg( 'mobile-frontend-editor-redlink-create' ),
						href: $( this ).attr( 'href' )
					} ).options,
					closeAnchor: new Anchor( {
						progressive: true,
						label: mw.msg( 'mobile-frontend-editor-redlink-leave' ),
						additionalClassNames: 'hide'
					} ).options,
					content: mw.msg( 'mobile-frontend-editor-redlink-explain' ),
					actionAnchor: false
				},
				drawer = new CtaDrawer( drawerOptions );

			// use preventDefault() and not return false to close other open drawers or anything else.
			ev.preventDefault();
			drawer.show();
		} );

		// Make sure we never create two edit links by accident
		// FIXME: split the selector and cache it
		if ( $caEdit.find( '.edit-page' ).length === 0 ) {
			$( '.nojs-edit' ).removeClass( 'nojs-edit' );
			$( '#ca-edit a' ).remove();
			// FIXME: unfortunately the main page is special cased.
			if ( mw.config.get( 'wgIsMainPage' ) || isNewPage || page.getLeadSectionElement().text() ) {
				// if lead section is not empty, open editor with lead section
				addEditButton( 0, '#ca-edit' );
			} else {
				// if lead section is empty, open editor with first section
				addEditButton( 1, '#ca-edit' );
			}
		}

		// enable all edit pencils in sub-sections for the article namespace except for the main
		// page, the pencils are unstyled there, see bug T89559
		// FIXME: Merge this with the line under it after main page special handling is killed
		if ( !mw.config.get( 'wgIsMainPage' ) && currentPage.getNamespaceId() === 0 ) {
			$( '.in-block>.edit-page' ).show();
		}
		$( '.edit-page' ).on( 'click', function ( ev ) {
			// prevent folding section when clicking Edit
			ev.stopPropagation();
		} );
	}

	/**
	 * Setup the editor if the user can edit the page otherwise show a sorry toast.
	 * @method
	 * @ignore
	 */
	function init() {
		if ( isEditable ) {
			setupEditor( currentPage );
		} else {
			if ( blockInfo ) {
				$caEdit.removeClass( 'hidden' );
				$( '#ca-edit' ).on( 'click', function ( ev ) {
					popup.show(
						mw.msg(
							'mobile-frontend-editor-blocked-info-loggedin',
							blockInfo.blockReason,
							blockInfo.blockedBy
						)
					);
					ev.preventDefault();
				} );
				$( '.edit-page' ).detach();
			} else {
				$caEdit.removeClass( 'hidden' );
				showSorryToast( 'mobile-frontend-editor-disabled' );
			}
		}
	}

	/**
	 * Initialize the edit button so that it launches a login call-to-action when clicked.
	 * @method
	 * @ignore
	 */
	function initCta() {
		// Initialize edit button links (to show Cta) only, if page is editable,
		// otherwise show an error toast
		if ( isEditable ) {
			$caEdit.addClass( enabledClass ).removeClass( disabledClass ).removeClass( 'hidden' );
			// Init lead section edit button
			makeCta( $caEdit, 0 );

			// Init all edit links (including lead section, if anonymous editing is enabled)
			$( '.edit-page' ).each( function () {
				var $a = $( this ),
					section = 0;

				if ( $( this ).data( 'section' ) !== undefined ) {
					section = $( this ).data( 'section' );
				}
				makeCta( $a, section );
			} );
		} else {
			$caEdit.removeClass( 'hidden' );
			showSorryToast( 'mobile-frontend-editor-disabled' );
		}
	}

	/**
	 * Show a toast message with sincere condolences.
	 * @method
	 * @ignore
	 * @param {String} msg Message key for sorry message
	 */
	function showSorryToast( msg ) {
		$( '#ca-edit, .edit-page' ).on( 'click', function ( ev ) {
			popup.show( mw.msg( msg ) );
			ev.preventDefault();
		} );
	}

	if ( !isEditingSupported ) {
		// Editing is disabled (or browser is blacklisted)
		$caEdit.removeClass( 'hidden' );
		showSorryToast( 'mobile-frontend-editor-unavailable' );
	} else if ( isNewFile ) {
		$caEdit.removeClass( 'hidden' );
		// Is a new file page (enable upload image only) Bug 58311
		showSorryToast( 'mobile-frontend-editor-uploadenable' );
	} else {
		if ( user.isAnon() ) {
			// Cta's will be rendered in EditorOverlay, if anonymous editing is enabled.
			if ( mw.config.get( 'wgMFEditorOptions' ).anonymousEditing ) {
				init();
			} else {
				initCta();
			}
		} else {
			init();
		}
	}

}( mw.mobileFrontend, jQuery ) );
