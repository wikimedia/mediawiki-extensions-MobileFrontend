// special casing for homepage
( function( $ ) {

$( function() {
	$( 'h1.section_0' ).remove();
	if ( $( '#mainpage' ).children().length === 0 || $( '#content' ).children().length === 0 ) {
		$( '<div class="alert warning">' ).html( mw.msg( 'mobile-frontend-empty-homepage-text' ) ).prependTo( '#content_wrapper' );
	}
} );

} ( jQuery ) );
