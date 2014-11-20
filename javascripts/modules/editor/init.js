( function ( M, $ ) {

	var
		settings = M.require( 'settings' ),
		Icon = M.require( 'Icon' ),
		disabledEditIcon = new Icon( {
			name: 'edit'
		} ),
		enabledEditIcon = new Icon( {
			name: 'edit-enabled'
		} ),
		enabledClass = enabledEditIcon.getGlyphClassName(),
		disabledClass = disabledEditIcon.getGlyphClassName(),
		user = M.require( 'user' ),
		popup = M.require( 'toast' ),
		// FIXME: Disable on IE < 10 for time being
		blacklisted = /MSIE \d\./.test( navigator.userAgent ),
		allowAnonymous = false,
		isEditingSupported = M.router.isSupported() && !blacklisted,
		isNewPage = M.getCurrentPage().options.id === 0,
		isNewFile = M.inNamespace( 'file' ) && isNewPage,
		veConfig = mw.config.get( 'wgVisualEditorConfig' ),
		// FIXME: Should we consider default site options and user prefs?
		isVisualEditorEnabled = M.isWideScreen() && veConfig,
		CtaDrawer = M.require( 'CtaDrawer' ),
		toast = M.require( 'toast' ),
		pendingToast = settings.get( 'mobile-pending-toast' ),
		drawer = new CtaDrawer( {
			queryParams: {
				campaign: 'mobile_editPageActionCta'
			},
			signupQueryParams: {
				returntoquery: 'article_action=signup-edit'
			},
			content: mw.msg( 'mobile-frontend-editor-cta' )
		} );

	if ( pendingToast ) {
		// delete the pending toast
		settings.save( 'mobile-pending-toast', '' );
		toast.show( pendingToast );
	}

	function addEditButton( section, container ) {
		return $( '<a class="edit-page">' )
			.attr( 'href', '#/editor/' + section )
			.text( mw.msg( 'mobile-frontend-editor-edit' ) )
			.prependTo( container );
	}

	function makeCta( $el, section, allowAnonymous ) {
		var options = {
			queryParams: {
				returnto: mw.config.get( 'wgPageName' ),
				returntoquery: 'action=edit&section=' + section
			}
		};

		if ( allowAnonymous ) {
			options.links = [ {
				label: mw.msg( 'mobile-frontend-editor-anon' ),
				href: $el[0].href,
				selector: 'edit-anon mw-ui-progressive'
			} ];
		}
		$el
			.on( 'click', function ( ev ) {
				ev.preventDefault();
				// prevent folding section when clicking Edit
				ev.stopPropagation();
				// need to use toggle() because we do ev.stopPropagation() (in addEditButton())
				drawer
					.render( options )
					.toggle();
			} )
			// needed until we use tap everywhere to prevent the link from being followed
			.on( 'click', false );
	}

	/*
	 * Retrieve the user's preferred editor setting. If none is set, return the default
	 * editor for this wiki.
	 *
	 * @return {string} Either 'VisualEditor' or 'SourceEditor'
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

	/*
	 * Initialize the edit button so that it launches the editor interface when clicked.
	 *
	 * @param {Page} page The page to edit.
	 */
	function setupEditor( page ) {
		var isNewPage = page.options.id === 0;
		if ( M.query.undo ) {
			window.alert( mw.msg( 'mobile-frontend-editor-undo-unsupported' ) );
		}

		M.overlayManager.add( /^\/editor\/(\d+)\/?([^\/]*)$/, function ( sectionId, funnel ) {
			var
				result = $.Deferred(),
				preferredEditor = getPreferredEditor(),
				editorOptions = {
					title: page.title,
					isAnon: user.isAnon(),
					isNewPage: isNewPage,
					isNewEditor: user.getEditCount() === 0,
					oldId: M.query.oldid,
					funnel: funnel || 'article',
					contentLang: $( '#content' ).attr( 'lang' ),
					contentDir: $( '#content' ).attr( 'dir' )
				},
				visualEditorNamespaces = veConfig && veConfig.namespaces;

			function loadSourceEditor() {
				M.loadModule( 'mobile.editor.overlay' ).done( function () {
					var EditorOverlay = M.require( 'modules/editor/EditorOverlay' );
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
				M.loadModule( 'mobile.editor.ve' ).done( function () {
					var VisualEditorOverlay = M.require( 'modules/editor/VisualEditorOverlay' );
					result.resolve( new VisualEditorOverlay( editorOptions ) );
				} ).fail( loadSourceEditor );
			} else {
				loadSourceEditor();
			}

			return result;
		} );
		$( '#ca-edit' ).addClass( enabledClass ).removeClass( disabledClass );

		// Make sure we never create two edit links by accident
		if ( $( '#ca-edit .edit-page' ).length === 0 ) {
			// FIXME: unfortunately the main page is special cased.
			if ( mw.config.get( 'wgIsMainPage' ) || isNewPage || M.getLeadSection().text() ) {
				// if lead section is not empty, open editor with lead section
				addEditButton( 0, '#ca-edit' );
			} else {
				// if lead section is empty, open editor with first section
				addEditButton( 1, '#ca-edit' );
			}
		}

		$( '.edit-page' ).on( 'click', function ( ev ) {
			// prevent folding section when clicking Edit
			ev.stopPropagation();
		} );
	}

	function init( page ) {
		page.isEditable( user ).done( function ( isEditable ) {
			if ( isEditable ) {
				setupEditor( page );
			} else {
				showSorryToast( 'mobile-frontend-editor-disabled' );
			}
		} );
	}

	/*
	 * Initialize the edit button so that it launches a login call-to-action when clicked.
	 * @param {boolean} allowAnonymous Whether the drawer has to include an edit anonymously link
	 */
	function initCta( allowAnonymous ) {
		// If anonymous editing is allowed, init the editor now to be useable for the "Edit w/o login" link in cta drawer
		if ( allowAnonymous ) {
			// init the editor
			init( M.getCurrentPage() );
		}

		// Initialize edit button links (to show Cta) only, if page is editable, otherwise show an error toast
		M.getCurrentPage().isEditable( user ).done( function ( isEditable ) {
			if ( isEditable ) {
				$( '#ca-edit' ).addClass( enabledClass ).removeClass( disabledClass );
				// Init #ca-edit only, if anonymous editing is disabled, if enabled, there is a link with .edit-page inside
				if ( !allowAnonymous ) {
					// Init lead section edit button
					makeCta( $( '#ca-edit' ), 0, allowAnonymous );
				}

				// Init all edit links (including lead section, if anonymous editing is enabled)
				$( '.edit-page' ).each( function () {
					var $a = $( this ),
						section = 0;

					if ( $( this ).data( 'section' ) !== undefined ) {
						section = $( this ).data( 'section' );
					}
					makeCta( $a, section, allowAnonymous );
				} );
			} else {
				showSorryToast( 'mobile-frontend-editor-disabled' );
			}
		} );
	}

	/*
	 * Show a toast message with sincere condolences.
	 *
	 * @param {string} msg Message key for sorry message
	 */
	function showSorryToast( msg ) {
		$( '#ca-edit, .edit-page' ).on( 'click', function ( ev ) {
			popup.show( mw.msg( msg ), 'toast' );
			ev.preventDefault();
		} );
	}

	if ( !isEditingSupported ) {
		// Editing is disabled (or browser is blacklisted)
		showSorryToast( 'mobile-frontend-editor-unavailable' );
	} else if ( isNewFile ) {
		// Is a new file page (enable upload image only) Bug 58311
		showSorryToast( 'mobile-frontend-editor-uploadenable' );
	} else {
		if ( user.isAnon() ) {
			// Set edit button to launch login CTA
			if ( mw.config.get( 'wgMFAnonymousEditing' ) ) {
				allowAnonymous = true;
			}
			initCta( allowAnonymous );
		} else {
			if ( mw.config.get( 'wgMFIsLoggedInUserBlocked' ) ) {
				// User is blocked. Both anonymous and logged in users can be blocked.
				showSorryToast( 'mobile-frontend-editor-blocked' );
			} else {
				init( M.getCurrentPage() );
			}
		}
	}

}( mw.mobileFrontend, jQuery ) );
