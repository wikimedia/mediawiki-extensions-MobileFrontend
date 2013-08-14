( function( M, $ ) {
	var
		toggle = M.require( 'toggle' ),
		currentPage;

	M.on( 'section-toggle', function( section_id ) {
		var
			$content = $( '#content_' + section_id ),
			loaded = $content.data( 'loaded' ), section;

		if ( !loaded && currentPage ) {
			section = currentPage.getSubSection( section_id );
			if ( section ) {
				$content.html( section.text ).data( 'loaded', true );
			}
			M.emit( 'section-rendered', $content );
		}
	} );

	function checkHash() {
		var hash = window.location.hash, el, section;
		if ( hash ) {
			section = currentPage.getSectionFromAnchor( hash.slice( 1 ) );
			if ( section ) {
				toggle.wm_toggle_section( section.index );
			}
			// force scroll if not scrolled (e.g. after subsection is loaded)
			el = $( hash );
			if ( el.length ) {
				el[ 0 ].scrollIntoView( true );
			}
		}
	}

	function refresh( page ) {
		var references = page.getReferenceSection();
		currentPage = page;
		if ( references ) {
			$( '#content_' + references.index ).html( references.content ).data( 'loaded', true );
			M.emit( 'references-loaded' );
		}
		checkHash();
	}

	M.on( 'page-loaded', refresh );

}( mw.mobileFrontend, jQuery ) );
