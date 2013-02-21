( function( $, M ) {
	var star = M.require( 'watchstar' );

	function init() {
		// FIXME: find more elegant way to not show watchlist stars on recent changes
		if ( $( '.mw-mf-watchlist-selector' ).length === 0 ) {
			star.initWatchListIconList( $( 'ul.mw-mf-watchlist-results' ), true );
		}
	}

	$( function() {
		init();
	} );

} )( jQuery, mw.mobileFrontend );
