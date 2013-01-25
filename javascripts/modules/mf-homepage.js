// special casing for homepage
( function( M, $ ) {

M.on( 'homepage-loaded', function() {
	$( 'h1.section_0' ).remove();
	if ( $( '#mainpage' ).children().length === 0 || $( '#content' ).children().length === 0 ) {
		$( '<h1>' ).html( M.message( 'empty-homepage' ) ).prependTo( '#content' );
	}
} );

} ( mw.mobileFrontend, jQuery ) );
