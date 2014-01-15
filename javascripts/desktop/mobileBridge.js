// The mobile bridge 'decorates' desktop skin so that the environment looks similar to mobile
jQuery( function( $ ) {
	// FIXME: Nasty hack so that Overlay's correctly show. Find better way to make this work.
	$( 'body' ).attr( 'id', 'mw-mf-viewport' );
	$( '<li id="page-secondary-actions">').appendTo( '#p-views ul' );
	mw.loader.using( 'mobile.geonotahack' );
} );
