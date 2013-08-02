( function( M, $ ) {
	var star = M.require( 'watchstar' );

	function init() {
		var $watchlist = $( 'ul.page-list' );
		// FIXME: find more elegant way to not show watchlist stars on recent changes
		if ( $( '.mw-mf-watchlist-selector' ).length === 0 ) {
			star.initWatchListIconList( $watchlist, true );
			$watchlist.find( 'a.title' ).on( 'mousedown', function() {
				// name funnel for watchlists to catch subsequent uploads
				$.cookie( 'mwUploadsFunnel', 'watchlist', { expires: new Date( new Date().getTime() + 60000 ) } );
			} );
		}
	}

	$( function() {
		init();
	} );

} )( mw.mobileFrontend, jQuery );
