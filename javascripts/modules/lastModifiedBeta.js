( function( M ) {
	var schema = M.require( 'loggingSchemas/MobileWebClickTracking' );

	function addClickTracking() {
		schema.hijackLink( '#mw-mf-last-modified', 'page-history' );
	}

	M.on( 'page-loaded', addClickTracking );
	addClickTracking();

}( mw.mobileFrontend ) );
