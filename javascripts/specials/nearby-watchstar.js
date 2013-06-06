( function( M ) {
var nearby = M.require( 'nearby' ),
	watchstar = M.require( 'watchstar' );

nearby.getOverlay().on( 'rendered', function( $el ) {
	watchstar.initWatchListIconList( $el.find( 'ul' ) );
} );

}( mw.mobileFrontend ) );
