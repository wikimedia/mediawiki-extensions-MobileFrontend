( function( M ) {

	M.on( 'section-rendered', function( $content ) {
		// FIXME: this should live in the hidpi module when dynamic sections is promoted from beta
		if ( $content.hidpi ) {
			$content.hidpi();
		}
	} );

} ( mw.mobileFrontend ) );
