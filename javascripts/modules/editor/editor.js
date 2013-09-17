( function( M, $ ) {

	var EditorOverlay = M.require( 'modules/editor/EditorOverlay' ),
		popup = M.require( 'notifications' ),
		// FIXME: Disable on IE < 10 for time being
		blacklisted = /MSIE \d\./.test( navigator.userAgent ),
		isEditingSupported = M.router.isSupported() && !blacklisted,
		CtaDrawer = M.require( 'CtaDrawer' ),
		drawer = new CtaDrawer( {
			queryParams: {
				campaign: 'mobile_editPageActionCta'
			},
			content: mw.msg( 'mobile-frontend-editor-cta' )
		} );

	function addEditButton( section, container ) {
		return $( '<a class="edit-page" href="#editor/' + section + '">' ).
			text( mw.msg( 'mobile-frontend-editor-edit' ) ).
			prependTo( container );
	}

	function makeCta( $el, hash, returnToQuery ) {
		$el.
			// FIXME change when micro.tap.js in stable
			on( M.tapEvent( 'mouseup' ), function( ev ) {
				ev.preventDefault();
				// prevent folding section when clicking Edit
				ev.stopPropagation();
				// need to use toggle() because we do ev.stopPropagation() (in addEditButton())
				drawer.
					render( { queryParams: {
						returnto: mw.config.get( 'wgPageName' ) + hash,
						returntoquery: returnToQuery
					} } ).
					toggle();
			} ).
			// needed until we use tap everywhere to prevent the link from being followed
			on( 'click', false );
	}

	// FIXME: remove when SkinMobile::doEditSectionLink present in cached pages
	function extractSectionIdFromEditLink( $a ) {
		var editHref = $a.attr( 'href' ),
			qs = editHref.split( '?' )[ 1 ],
			section = M.deParam( qs ).section;
		return section;
	}

	function init( page ) {
		var isNew = mw.config.get( 'wgArticleId' ) === 0;

		M.router.route( /^editor\/(\d+)$/, function( sectionId ) {
			var title = page ? page.title : mw.config.get( 'wgTitle' ),
				// Note in current implementation Page title is prefixed with namespace
				ns = page ? '' : mw.config.get( 'wgCanonicalNamespace' );

			sectionId = parseInt( sectionId, 10 );
			new EditorOverlay( {
				title: ns ? ns + ':' + title : title,
				isNew: isNew,
				isNewEditor: mw.config.get( 'wgUserEditCount' ) === '0',
				sectionId: mw.config.get( 'wgPageContentModel' ) === 'wikitext' ? sectionId : null
			} ).show();
		} );
		$( '#ca-edit' ).addClass( 'enabled' );

		// FIXME: unfortunately the main page is special cased.
		if ( mw.config.get( 'wgIsMainPage' ) || isNew || $( '#content_0' ).text() ) {
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

		// FIXME: remove when SkinMobile::doEditSectionLink present in cached pages
		$( 'h2 .mw-editsection' ).each( function() {
			var section = extractSectionIdFromEditLink( $( this ).find( 'a' ) );
			if ( section ) {
				addEditButton( section, $( this ).parent() ).
					// FIXME change when micro.tap.js in stable
					on( M.tapEvent( 'mouseup' ), function( ev ) {
						// prevent folding section when clicking Edit
						ev.stopPropagation();
					} );
			}
			$( this ).remove();
		} );
	}

	function initCta() {
		// FIXME change when micro.tap.js in stable
		$( '#ca-edit' ).addClass( 'enabled' ).on( M.tapEvent( 'click' ), function() {
			drawer.render( { queryParams :{ returntoquery: 'article_action=edit' } } ).show();
		} );

		$( '.edit-page' ).each( function() {
			var $a = $( this ), $heading = $( this ).closest( 'h2' );

			if ( mw.config.get( 'wgMFMode' ) === 'stable' ) {
				makeCta( $a, '#' + $heading.attr( 'id' ) );
			} else {
				makeCta( $a, '#' + $heading.attr( 'id' ), 'article_action=edit' );
			}
		} );

		// FIXME: remove when SkinMobile::doEditSectionLink present in cached pages
		$( 'h2 .mw-editsection' ).each( function() {
			var $heading = $( this ).closest( 'h2' ), $a = addEditButton( '', $heading );

			if ( mw.config.get( 'wgMFMode' ) === 'stable' ) {
				makeCta( $a, '#' + $heading.attr( 'id' ) );
			} else {
				makeCta( $a, '#' + $heading.attr( 'id' ), 'article_action=edit' );
			}
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
