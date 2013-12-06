( function( M, $ ) {

	var
		inStable = mw.config.get( 'wgMFMode' ) === 'stable',
		user = M.require( 'user' ),
		popup = M.require( 'notifications' ),
		isUserBlocked = mw.config.get( 'wgMFIsUserBlocked' ),
		// FIXME: Disable on IE < 10 for time being
		blacklisted = /MSIE \d\./.test( navigator.userAgent ),
		isEditingSupported = M.router.isSupported() && !blacklisted,
		// FIXME: Should we consider default site options and user prefs?
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

	function init( page ) {
		var isNew = mw.config.get( 'wgArticleId' ) === 0;
		if ( M.query.undo ) {
			window.alert( mw.msg( 'mobile-frontend-editor-undo-unsupported' ) );
		}

		M.router.route( /^editor\/(\d+)\/?([^\/]*)$/, function( sectionId, funnel ) {
			// FIXME: clean up when new overlays in stable
			var
				LoadingOverlay = M.require( inStable ? 'LoadingOverlay' : 'LoadingOverlayNew' ),
				loadingOverlay = new LoadingOverlay(),
				title = page ? page.title : mw.config.get( 'wgTitle' ),
				// Note in current implementation Page title is prefixed with namespace
				ns = page ? '' : mw.config.get( 'wgCanonicalNamespace' );
			loadingOverlay.show();
			sectionId = mw.config.get( 'wgPageContentModel' ) === 'wikitext' ? parseInt( sectionId, 10 ) : null;

			// FIXME: clean up when new overlays in stable
			if ( isVisualEditorEnabled ) {
				// Load VE init module
				mw.loader.using( 'mobile.editor.ve', function () {
					var VisualEditorOverlay = M.require( 'modules/editor/VisualEditorOverlay' ),
						visualEditorOverlay = new VisualEditorOverlay( {
							title: ns ? ns + ':' + title : title,
							sectionId: sectionId
						} );
					loadingOverlay.hide();
					visualEditorOverlay.show();
				} );
			} else {
				mw.loader.using( inStable ? 'mobile.editor.overlay.stable' : 'mobile.editor.overlay.beta', function() {
					var EditorOverlay = M.require( inStable ? 'modules/editor/EditorOverlay' : 'modules/editorNew/EditorOverlay' );

						loadingOverlay.hide();
						new EditorOverlay( {
							title: ns ? ns + ':' + title : title,
							isNew: isNew,
							isNewEditor: user.getEditCount() === 0,
							sectionId: sectionId,
							funnel: funnel || 'article'
						} ).show();
					} );
				}
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

	if ( mw.config.get( 'wgIsPageEditable' ) && isEditingSupported && !isUserBlocked ) {
		if ( mw.config.get( 'wgMFAnonymousEditing' ) || user.getName() ) {
			init();
			M.on( 'page-loaded', init );
		} else {
			initCta();
			M.on( 'page-loaded', initCta );
		}
	} else {
		// FIXME change when micro.tap.js in stable
		$( '#ca-edit, .edit-page' ).on( M.tapEvent( 'click' ), function( ev ) {
			var msg = 'mobile-frontend-editor-blocked';
			if ( !isUserBlocked ) {
				msg = isEditingSupported ? 'mobile-frontend-editor-disabled' : 'mobile-frontend-editor-unavailable';
			}
			popup.show( mw.msg( msg ), 'toast' );
			ev.preventDefault();
		} );
	}

}( mw.mobileFrontend, jQuery ) );
