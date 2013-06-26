( function( M, $ ) {

	function deParam( qs ) {
		var params = {};
		if ( qs ) {
			qs.split( '&' ).forEach( function( p ) {
				p = p.split( '=' );
				params[ p[0] ] = p[1];
			} );
		}
		return params;
	}
	$.extend( M, {
		deParam: deParam
	} );

}( mw.mobileFrontend, jQuery ) );
