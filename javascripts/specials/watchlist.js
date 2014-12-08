( function ( M, $ ) {
	var watchlist,
		WatchList = M.require( 'modules/watchlist/WatchList' ),
		schema = M.require( 'loggingSchemas/MobileWebClickTracking' ),
		canonicalName = mw.config.get( 'wgCanonicalSpecialPageName' ),
		pageName = canonicalName === 'EditWatchlist' || canonicalName === 'Watchlist' ? 'watchlist' : 'diff',
		subPageName = M.query.watchlistview || 'a-z';

	/**
	 * Initialises JavaScript on Special:Watchlist
	 * @method
	 * @ignore
	 */
	function init() {
		var $watchlist = $( 'ul.page-list' ),
			actionNamePrefix = pageName + '-' + subPageName + '-';

		// FIXME: find more elegant way to not show watchlist stars on recent changes
		if ( $( '.mw-mf-watchlist-selector' ).length === 0 ) {
			watchlist = new WatchList( {
				el: $watchlist,
				enhance: true
			} );
			watchlist.on( 'unwatch', function () {
				schema.log( 'Watchlist', actionNamePrefix + 'unwatch' );
			} );
			watchlist.on( 'watch', function () {
				schema.log( 'Watchlist', actionNamePrefix + 'watch' );
			} );
		}

		// Register EventLogging events
		schema.hijackLink( 'Watchlist', '.button-bar a', actionNamePrefix + 'switch' );
		schema.hijackLink( 'Watchlist', '.mw-mf-watchlist-selector a', actionNamePrefix + 'filter' );
		schema.hijackLink( 'Watchlist', '.page-list .title', actionNamePrefix + 'view' );
		schema.hijackLink( 'Watchlist', '.more', actionNamePrefix + 'more' );
	}

	$( function () {
		init();
	} );

} )( mw.mobileFrontend, jQuery );
