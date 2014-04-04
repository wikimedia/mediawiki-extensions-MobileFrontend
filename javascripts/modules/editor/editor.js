( function( M, $ ) {

	var
		user = M.require( 'user' ),
		popup = M.require( 'toast' ),
		// FIXME: Disable on IE < 10 for time being
		blacklisted = /MSIE \d\./.test( navigator.userAgent ),
		isEditingSupported = M.router.isSupported() && !blacklisted,
		// FIXME: Should we consider default site options and user prefs?
		// FIXME: This also needs to check that VisualEditor is actually installed.
		isVisualEditorEnabled = M.isWideScreen() && mw.config.get( 'wgMFMode' ) === 'alpha',
		LoadingOverlay = M.require( 'LoadingOverlayNew' ),
		CtaDrawer = M.require( 'CtaDrawer' ),
		drawer = new CtaDrawer( {
			queryParams: {
				campaign: 'mobile_editPageActionCta',
				returntoquery: 'article_action=edit'
			},
			signupQueryParams: { returntoquery: 'article_action=signup-edit' },
			content: mw.msg( 'mobile-frontend-editor-cta' )
		} );

	function addEditButton( section, container, page ) {
		// Pages that contain JavaScript and CSS are not suitable for VisualEditor so check if wikitext.
		var url = page.isWikiText() && isVisualEditorEnabled ? '#/VisualEditor/' + section : '#editor/' + section;
		return $( '<a class="edit-page">' ).
			attr( 'href', url ).
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
	 * @param {Page} page The page to edit.
	 */
	function setupEditor( page ) {
		var isNewPage = page.options.id === 0;
		if ( M.query.undo ) {
			window.alert( mw.msg( 'mobile-frontend-editor-undo-unsupported' ) );
		}

		if ( isVisualEditorEnabled ) {
			M.overlayManager.add( /^\/VisualEditor\/(\d+)$/, function( sectionId ) {
				var
					loadingOverlay = new LoadingOverlay(),
					result = $.Deferred();
				loadingOverlay.show();

				// Load VE init module
				mw.loader.using( 'mobile.editor.ve', function () {
					var VisualEditorOverlay = M.require( 'modules/editor/VisualEditorOverlay' );
					loadingOverlay.hide();
					result.resolve( new VisualEditorOverlay( {
						title: page.title,
						sectionId: parseInt( sectionId, 10 )
					} ) );
				} );
				return result;
			} );
		}

		M.overlayManager.add( /^editor\/(\d+)\/?([^\/]*)$/, function( sectionId, funnel ) {
			var
				loadingOverlay = new LoadingOverlay(),
				result = $.Deferred();
			loadingOverlay.show();
			sectionId = page.isWikiText() ? parseInt( sectionId, 10 ) : null;

			mw.loader.using( 'mobile.editor.overlay', function() {
				var EditorOverlay = M.require( 'modules/editor/EditorOverlay' );

				loadingOverlay.hide();
				result.resolve( new EditorOverlay( {
					title: page.title,
					isNewPage: isNewPage,
					isNewEditor: user.getEditCount() === 0,
					sectionId: sectionId,
					oldId: M.query.oldid,
					funnel: funnel || 'article'
				} ) );
			} );

			return result;
		} );
		$( '#ca-edit' ).addClass( 'enabled' );

		// Make sure we never create two edit links by accident
		if ( $( '#ca-edit .edit-page' ).length === 0 ) {
			// FIXME: unfortunately the main page is special cased.
			if ( mw.config.get( 'wgIsMainPage' ) || isNewPage || M.getLeadSection().text() ) {
				// if lead section is not empty, open editor with lead section
				addEditButton( 0, '#ca-edit', page );
			} else {
				// if lead section is empty, open editor with first section
				addEditButton( 1, '#ca-edit', page );
			}
		}

		if ( isVisualEditorEnabled ) {
			// Point all section edit links to VE
			$( '#content .edit-page' ).each( function() {
				var $this = $( this );
				$this.attr( 'href', '#/VisualEditor/' + $this.data( 'section' ) );
			} );
		}
		// FIXME change when micro.tap.js in stable
		$( '.edit-page' ).on( M.tapEvent( 'mouseup' ), function( ev ) {
			// prevent folding section when clicking Edit
			ev.stopPropagation();
		} );
	}

	function init( page ) {
		page.isEditable( user ).done( function( isEditable ) {
			if ( isEditable ) {
				setupEditor( page );
			} else {
				showSorryToast( 'mobile-frontend-editor-disabled' );
			}
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

	if ( !isEditingSupported ) {
		// Editing is disabled (or browser is blacklisted)
		showSorryToast( 'mobile-frontend-editor-unavailable' );
	} else {
		if ( user.isAnon() && !mw.config.get( 'wgMFAnonymousEditing' ) ) {
			// Set edit button to launch login CTA
			initCta();
			M.on( 'page-loaded', initCta );
		} else {
			if ( mw.config.get( 'wgMFIsLoggedInUserBlocked' ) ) {
				// User is blocked. Both anonymous and logged in users can be blocked.
				showSorryToast( 'mobile-frontend-editor-blocked' );
			} else {
				init( M.getCurrentPage() );
				M.on( 'page-loaded', init );
			}
		}
	}

}( mw.mobileFrontend, jQuery ) );
