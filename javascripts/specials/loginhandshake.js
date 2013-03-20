( function( $ ) {
	$.cookie( 'loginHandshake', '1' );

	if ( document.referrer ) {
		document.location = document.referrer;
	}
}( jQuery ) );
