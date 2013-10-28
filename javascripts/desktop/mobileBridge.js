// The mobile bridge 'decorates' desktop skin so that the environment looks similar to mobile
jQuery( function( $ ) {
	// FIXME: Nasty hack so that Overlay's correctly show. Find better way to make this work.
	$( 'body' ).attr( 'id', 'mw-mf-viewport' );
	$( '<div id="page-secondary-actions" class="buttonBar">' ).insertAfter( '#firstHeading' );
	mw.loader.using( 'mobile.geonotahack' );
} );
