( function( M, $ ) {

	var
		inStable = mw.config.get( 'wgMFMode' ) === 'stable',
		popup = M.require( 'notifications' ),
		// FIXME: Disable on IE < 10 for time being
		blacklisted = /MSIE \d\./.test( navigator.userAgent ),
		isEditingSupported = M.router.isSupported() && !blacklisted,
		CtaDrawer = M.require( 'CtaDrawer' ),
		drawer = new CtaDrawer( {
			queryParams: {
				campaign: 'mobile_editPageActionCta'
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
				loadingOverlay = new LoadingOverlay();
			loadingOverlay.show();

			// FIXME: clean up when new overlays in stable
			mw.loader.using( inStable ? 'mobile.editor.overlay.stable' : 'mobile.editor.overlay.beta', function() {
				var EditorOverlay = M.require( inStable ? 'modules/editor/EditorOverlay' : 'modules/editorNew/EditorOverlay' ),
					title = page ? page.title : mw.config.get( 'wgTitle' ),
					// Note in current implementation Page title is prefixed with namespace
					ns = page ? '' : mw.config.get( 'wgCanonicalNamespace' );

				sectionId = parseInt( sectionId, 10 );
				loadingOverlay.hide();
				new EditorOverlay( {
					title: ns ? ns + ':' + title : title,
					isNew: isNew,
					isNewEditor: mw.config.get( 'wgUserEditCount' ) === 0,
					sectionId: mw.config.get( 'wgPageContentModel' ) === 'wikitext' ? sectionId : null,
					funnel: funnel || 'article'
				} ).show();
			} );
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

		// FIXME: remove when edit AB test is done
		if ( M.query.article_action === 'signup-edit' ) {
			$( '.edit-page' ).each( function() {
				$( this ).attr( 'href', $( this ).attr( 'href' ) + '/ctaSignup' );
			} );
		}
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

	if ( mw.config.get( 'wgIsPageEditable' ) && isEditingSupported ) {
		if ( mw.config.get( 'wgMFAnonymousEditing' ) || mw.config.get( 'wgUserName' ) ) {
			init();
			M.on( 'page-loaded', init );
		} else {
			initCta();
			M.on( 'page-loaded', initCta );
		}
	} else {
		// FIXME change when micro.tap.js in stable
		$( '#ca-edit, .edit-page' ).on( M.tapEvent( 'click' ), function( ev ) {
			popup.show( mw.msg( isEditingSupported ? 'mobile-frontend-editor-disabled' : 'mobile-frontend-editor-unavailable' ), 'toast' );
			ev.preventDefault();
		} );
	}

}( mw.mobileFrontend, jQuery ) );
