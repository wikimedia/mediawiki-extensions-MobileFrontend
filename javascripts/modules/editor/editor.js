( function( M, $ ) {

	var EditorOverlay = M.require( 'modules/editor/EditorOverlay' ),
		popup = M.require( 'notifications' ),
		// FIXME: Disable on IE < 10 for time being
		blacklisted = /MSIE \d\./.test( navigator.userAgent ),
		isEditingSupported = M.router.isSupported() && !blacklisted,
		CtaDrawer = M.require( 'CtaDrawer' ),
		drawer = new CtaDrawer( { content: mw.msg( 'mobile-frontend-editor-cta' ) } );

	function addEditButton( section, container ) {
		return $( '<a class="edit-page inline" href="#editor-' + section + '">' ).
			text( mw.msg( 'mobile-frontend-editor-edit' ) ).
			prependTo( container ).
			// FIXME change when micro.tap.js in stable
			on( mw.config.get( 'wgMFMode' ) === 'alpha' ? 'tap' : 'mouseup', function( ev ) {
				// prevent folding section when clicking Edit
				ev.stopPropagation();
			} );
	}

	function addCtaButton( sectionId, container ) {
		addEditButton( '', container ).
			// FIXME change when micro.tap.js in stable
			on( mw.config.get( 'wgMFMode' ) === 'alpha' ? 'tap' : 'mouseup', function( ev ) {
				ev.preventDefault();
				// need to use toggle() because we do ev.stopPropagation() (in addEditButton())
				drawer.render( { returnTo: mw.config.get( 'wgPageName' ) + '#' + sectionId } ).toggle();
			} ).
			// needed until we use tap everywhere to prevent the link from being followed
			on( 'click', false );
	}

	function init( page ) {
		// Note on ajax loaded pages that do not exist we force a refresh of the url using window.location so we can rely on this
		var isNew = mw.config.get( 'wgArticleId' ) === 0;

		M.router.route( /^editor-(\d+)$/, function( sectionId ) {
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

		$( 'h2 .mw-editsection' ).each( function() {
			// FIXME [ParserOutput]: This is nasty
			var editHref = $( this ).find( 'a' ).attr( 'href' ),
				qs = editHref.split( '?' )[ 1 ],
				section = M.deParam( qs ).section;
			if ( section ) {
				addEditButton( section, $( this ).parent() );
			}
			$( this ).remove();
		} );
	}

	function initCta() {
		// FIXME change when micro.tap.js in stable
		$( '#ca-edit' ).addClass( 'enabled' ).on( mw.config.get( 'wgMFMode' ) === 'alpha' ? 'tap' : 'click', function() {
			drawer.render( { returnToQuery: 'article_action=edit' } ).show();
		} );

		// Don't use h2 as there can be h2s elsewhere in interface (e.g. footer)
		$( '.section_heading' ).each( function() {
			var $el = $( this );
			addCtaButton( $el.attr( 'id' ), $el );
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
		$( '#ca-edit' ).on( mw.config.get( 'wgMFMode' ) === 'alpha' ? 'tap' : 'click', function() {
			popup.show( mw.msg( isEditingSupported ? 'mobile-frontend-editor-disabled' : 'mobile-frontend-editor-unavailable' ), 'toast' );
		} );
	}

}( mw.mobileFrontend, jQuery ) );
