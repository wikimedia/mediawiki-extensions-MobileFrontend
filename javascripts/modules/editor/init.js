( function ( M, $ ) {

	var
		settings = M.require( 'settings' ),
		router = M.require( 'router' ),
		overlayManager = M.require( 'overlayManager' ),
		loader = M.require( 'loader' ),
		Icon = M.require( 'Icon' ),
		disabledEditIcon = new Icon( {
			name: 'edit'
		} ),
		enabledEditIcon = new Icon( {
			name: 'edit-enabled'
		} ),
		currentPage = M.getCurrentPage(),
		enabledClass = enabledEditIcon.getGlyphClassName(),
		disabledClass = disabledEditIcon.getGlyphClassName(),
		browser = M.require( 'browser' ),
		context = M.require( 'context' ),
		user = M.require( 'user' ),
		popup = M.require( 'toast' ),
		// FIXME: Disable on IE < 10 for time being
		blacklisted = /MSIE \d\./.test( navigator.userAgent ),
		isEditingSupported = router.isSupported() && !blacklisted,
		// FIXME: Use currentPage.getId()
		isNewPage = currentPage.options.id === 0,
		isNewFile = currentPage.inNamespace( 'file' ) && isNewPage,
		veConfig = mw.config.get( 'wgVisualEditorConfig' ),
		// FIXME: Should we consider default site options and user prefs?
		isVisualEditorEnabled = browser.isWideScreen() && veConfig,
		CtaDrawer = M.require( 'CtaDrawer' ),
		toast = M.require( 'toast' ),
		pendingToast = settings.get( 'mobile-pending-toast' ),
		drawer,
		$caEdit = $( '#ca-edit' );

	if ( pendingToast ) {
		// delete the pending toast
		settings.save( 'mobile-pending-toast', '' );
		toast.show( pendingToast );
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
			.attr( 'href', '#/editor/' + section )
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
		var options = {
			queryParams: {
				returnto: mw.config.get( 'wgPageName' ),
				returntoquery: 'action=edit&section=' + section
			}
		};

		$el
			.on( 'click', function ( ev ) {
				ev.preventDefault();
				// prevent folding section when clicking Edit
				ev.stopPropagation();
				// need to use toggle() because we do ev.stopPropagation() (in addEditButton())
				if ( !drawer ) {
					drawer = new CtaDrawer( {
						queryParams: {
							campaign: 'mobile_editPageActionCta'
						},
						signupQueryParams: {
							returntoquery: 'article_action=signup-edit'
						},
						content: mw.msg( 'mobile-frontend-editor-cta' )
					} );
				}
				drawer
					.render( options )
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

		overlayManager.add( /^\/editor\/(\d+)\/?([^\/]*)$/, function ( sectionId, funnel ) {
			var
				result = $.Deferred(),
				preferredEditor = getPreferredEditor(),
				editorOptions = {
					title: page.title,
					isAnon: user.isAnon(),
					isNewPage: isNewPage,
					isNewEditor: user.getEditCount() === 0,
					oldId: mw.util.getParamValue( 'oldid' ),
					funnel: funnel || 'article',
					// FIXME: cache this selector, it's used more than once
					contentLang: $( '#content' ).attr( 'lang' ),
					contentDir: $( '#content' ).attr( 'dir' )
				},
				visualEditorNamespaces = veConfig && veConfig.namespaces;

			/**
			 * Load source editor
			 * @private
			 * @ignore
			 * @method
			 */
			function loadSourceEditor() {
				var rlModuleName, moduleName;
				if ( mw.config.get( 'wgMFCodeMirror' ) && context.isAlphaGroupMember() ) {
					moduleName = 'modules/editor/EditorOverlayCodeMirror';
					rlModuleName = 'mobile.editor.overlay.codemirror';
				} else {
					moduleName = 'modules/editor/EditorOverlay';
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
				loader.loadModule( 'mobile.editor.ve' ).done( function () {
					var VisualEditorOverlay = M.require( 'modules/editor/VisualEditorOverlay' );
					result.resolve( new VisualEditorOverlay( editorOptions ) );
				} ).fail( loadSourceEditor );
			} else {
				loadSourceEditor();
			}

			return result;
		} );
		$caEdit.addClass( enabledClass ).removeClass( disabledClass ).removeClass( 'hidden' );

		// Make sure we never create two edit links by accident
		// FIXME: split the selector and cache it
		if ( $caEdit.find( '.edit-page' ).length === 0 ) {
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
		if ( currentPage.isEditable( user ) ) {
			setupEditor( currentPage );
		} else {
			$caEdit.removeClass( 'hidden' );
			showSorryToast( 'mobile-frontend-editor-disabled' );
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
		if ( currentPage.isEditable( user ) ) {
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
			popup.show( mw.msg( msg ), 'toast' );
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
			if ( mw.config.get( 'wgMFEditorOptions' ).anonymousEditing || context.isAlphaGroupMember() ) {
				init();
			} else {
				initCta();
			}
		} else {
			if ( mw.config.get( 'wgMFIsLoggedInUserBlocked' ) ) {
				$caEdit.removeClass( 'hidden' );
				// User is blocked. Both anonymous and logged in users can be blocked.
				showSorryToast( 'mobile-frontend-editor-blocked' );
			} else {
				init();
			}
		}
	}

}( mw.mobileFrontend, jQuery ) );
