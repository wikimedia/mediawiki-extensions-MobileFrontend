( function ( M, $ ) {
	var watchlist,
		WatchList = M.require( 'mobile.watchlist/WatchList' );

	/**
	 * Initialises JavaScript on Special:Watchlist
	 * @method
	 * @ignore
	 */
	function init() {
		var $watchlist = $( 'ul.page-list' );

		// FIXME: find more elegant way to not show watchlist stars on recent changes
		if ( $( '.mw-mf-watchlist-selector' ).length === 0 ) {
			watchlist = new WatchList( {
				api: new mw.Api(),
				el: $watchlist,
				funnel: 'watchlist',
				enhance: true
			} );
			$watchlist.find( '.page-summary .info' ).css( 'visibility', 'visible' );
		}
		// not needed now we have JS view which has infinite scrolling
		$( '.more' ).remove();
	}

	$( function () {
		init();
	} );

} )( mw.mobileFrontend, jQuery );
