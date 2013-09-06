( function( M, $ ) {
	var currentPage;

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

	function refresh( page ) {
		var references = page.getReferenceSection();
		currentPage = page;
		if ( references ) {
			$( '#content_' + references.index ).html( references.content ).data( 'loaded', true );
			M.emit( 'references-loaded' );
		}
	}

	M.on( 'page-loaded', refresh );

}( mw.mobileFrontend, jQuery ) );
