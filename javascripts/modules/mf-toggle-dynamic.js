( function( M, $ ) {

	M.on( 'section-toggle', function( $heading ) {
		var
			$content = $heading.next( '.content_block' ),
			loaded = $content.data( 'loaded' ), section,
			page = M.getCurrentPage(),
			// FIXME: see JavaScript for Page.js
			id = $heading.data( 'id' );

		if ( !loaded && page && id ) {
			section = page.getSubSection( id );
			if ( section ) {
				$content.html( section.text ).data( 'loaded', true );
			}
			M.emit( 'section-rendered', $content );
		}
	} );

	function refresh( page ) {
		var references = page.getReferenceSection();
		if ( references ) {
			$( '#content_' + references.index ).html( references.content ).data( 'loaded', true );
			M.emit( 'references-loaded' );
		}
	}

	M.on( 'page-loaded', refresh );

}( mw.mobileFrontend, jQuery ) );
