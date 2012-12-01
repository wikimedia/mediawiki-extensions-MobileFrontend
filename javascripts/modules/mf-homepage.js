// special casing for homepage
( function( M, $ ) {

$( window ).on( 'mw-mf-homepage-loaded', function() {
	$( 'h1' ).remove();
	if ( $( '#mainpage' ).children().length === 0 || $( '#content' ).children().length === 0 ) {
		$( '<h1>' ).html( M.message( 'empty-homepage' ) ).prependTo( '#content' );
	}
} );

} ( mw.mobileFrontend, jQuery ) );
