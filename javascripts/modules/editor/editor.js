( function( M, $ ) {

	var
		inStable = mw.config.get( 'wgMFMode' ) === 'stable',
		user = M.require( 'user' ),
		popup = M.require( 'toast' ),
		isUserBlocked = mw.config.get( 'wgMFIsUserBlocked' ),
		// FIXME: Disable on IE < 10 for time being
		blacklisted = /MSIE \d\./.test( navigator.userAgent ),
		isEditingSupported = M.router.isSupported() && !blacklisted,
		// FIXME: Should we consider default site options and user prefs?
		// FIXME: This also needs to check that VisualEditor is actually installed.
		isVisualEditorEnabled = M.isWideScreen() && mw.config.get( 'wgMFMode' ) === 'alpha',
		CtaDrawer = M.require( 'CtaDrawer' ),
		drawer = new CtaDrawer( {
			queryParams: {
				campaign: 'mobile_editPageActionCta',
				returntoquery: 'article_action=edit'
			},
			signupQueryParams: { returntoquery: 'article_action=signup-edit' },
			content: mw.msg( 'mobile-frontend-editor-cta' )
		} );

	function addEditButton( section, container ) {
		return $( '<a class="edit-page" href="#editor/' + section + '">' ).
			text( mw.msg( 'mobile-frontend-editor-edit' ) ).
			prependTo( container );
	}

	function makeCta( $el, hash ) {
		$el.
			// FIXME change when micro.tap.js in stable
			on( M.tapEvent( 'mouseup' ), function( ev ) {
				ev.preventDefault();
				// prevent folding section when clicking Edit
				ev.stopPropagation();
				// need to use toggle() because we do ev.stopPropagation() (in addEditButton())
				drawer.
					render( { queryParams: { returnto: mw.config.get( 'wgPageName' ) + hash } } ).
					toggle();
			} ).
			// needed until we use tap everywhere to prevent the link from being followed
			on( 'click', false );
	}

	/**
	 * Initialize the edit button so that it launches the editor interface when clicked.
	 *
	 * @param {object} page The page to edit (optional). If no page is specified it
	 *  assumes the current page.
	 */
	function init( page ) {
		var isNew = mw.config.get( 'wgArticleId' ) === 0;
		if ( M.query.undo ) {
			window.alert( mw.msg( 'mobile-frontend-editor-undo-unsupported' ) );
		}

		M.overlayManager.add( /^editor\/(\d+)\/?([^\/]*)$/, function( sectionId, funnel ) {
			// FIXME: clean up when new overlays in stable
			var
				LoadingOverlay = M.require( inStable ? 'LoadingOverlay' : 'LoadingOverlayNew' ),
				loadingOverlay = new LoadingOverlay(),
				title = page ? page.title : mw.config.get( 'wgTitle' ),
				// Note in current implementation Page title is prefixed with namespace
				ns = page ? '' : mw.config.get( 'wgCanonicalNamespace' ),
				result = $.Deferred();
			loadingOverlay.show();
			sectionId = mw.config.get( 'wgPageContentModel' ) === 'wikitext' ? parseInt( sectionId, 10 ) : null;

			// FIXME: clean up when new overlays in stable
			if ( isVisualEditorEnabled ) {
				// Load VE init module
				mw.loader.using( 'mobile.editor.ve', function () {
					var VisualEditorOverlay = M.require( 'modules/editor/VisualEditorOverlay' );
					loadingOverlay.hide();
					result.resolve( new VisualEditorOverlay( {
						// FIXME: use wgPageName (?)
						title: ns ? ns + ':' + title : title,
						sectionId: sectionId
					} ) );
				} );
			} else {
				mw.loader.using( inStable ? 'mobile.editor.overlay.stable' : 'mobile.editor.overlay.beta', function() {
					var EditorOverlay = M.require( inStable ? 'modules/editor/EditorOverlay' : 'modules/editorNew/EditorOverlay' );

					loadingOverlay.hide();
					result.resolve( new EditorOverlay( {
						// FIXME: use wgPageName (?)
						title: ns ? ns + ':' + title : title,
						isNew: isNew,
						isNewEditor: user.getEditCount() === 0,
						sectionId: sectionId,
						oldId: M.query.oldid,
						funnel: funnel || 'article'
					} ) );
				} );
			}

			return result;
		} );
		$( '#ca-edit' ).addClass( 'enabled' );

		// FIXME: unfortunately the main page is special cased.
		if ( mw.config.get( 'wgIsMainPage' ) || isNew || M.getLeadSection().text() ) {
			// if lead section is not empty, open editor with lead section
			addEditButton( 0, '#ca-edit' );
		} else {
			// if lead section is empty, open editor with first section
			addEditButton( 1, '#ca-edit' );
		}

		// FIXME change when micro.tap.js in stable
		$( '.edit-page' ).on( M.tapEvent( 'mouseup' ), function( ev ) {
			// prevent folding section when clicking Edit
			ev.stopPropagation();
		} );
	}

	/**
	 * Initialize the edit button so that it launches a login call-to-action when clicked.
	 */
	function initCta() {
		// FIXME change when micro.tap.js in stable
		$( '#ca-edit' ).addClass( 'enabled' ).on( M.tapEvent( 'click' ), function() {
			drawer.render().show();
		} );

		$( '.edit-page' ).each( function() {
			var $a = $( this ), anchor = '#' + $( this ).parent().find( '[id]' ).attr( 'id' );
			makeCta( $a, anchor );
		} );
	}

	/**
	 * Show a toast message with sincere condolences.
	 *
	 * @param {string} msg Message key for sorry message
	 */
	function showSorryToast( msg ) {
		$( '#ca-edit, .edit-page' ).on( M.tapEvent( 'click' ), function( ev ) {
			popup.show( mw.msg( msg ), 'toast' );
			ev.preventDefault();
		} );
	}

	if ( isUserBlocked ) {
		// User is blocked. Both anonymous and logged in users can be blocked.
		showSorryToast( 'mobile-frontend-editor-blocked' );
	} else if ( !isEditingSupported ) {
		// Editing is disabled (or browser is blacklisted)
		showSorryToast( 'mobile-frontend-editor-unavailable' );
	} else {
		if ( user.isAnon() ) {
			if ( mw.config.get( 'wgMFAnonymousEditing' ) && mw.config.get( 'wgIsPageEditable' ) ) {
				// Set edit button to launch editor
				init();
				M.on( 'page-loaded', init );
			} else {
				// Set edit button to launch login CTA
				initCta();
				M.on( 'page-loaded', initCta );
			}
		} else {
			// User is logged in
			if ( mw.config.get( 'wgIsPageEditable' ) ) {
				// Set edit button to launch editor
				init();
				M.on( 'page-loaded', init );
			} else {
				// Page is not editable (probably protected)
				showSorryToast( 'mobile-frontend-editor-disabled' );
			}
		}
	}

}( mw.mobileFrontend, jQuery ) );
