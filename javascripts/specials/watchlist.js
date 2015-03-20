( function ( M, $ ) {
	var watchlist,
		WatchList = M.require( 'modules/watchlist/WatchList' ),
		SchemaMobileWebClickTracking = M.require( 'loggingSchemas/SchemaMobileWebClickTracking' ),
		wlSchema = new SchemaMobileWebClickTracking( {}, 'MobileWebWatchlistClickTracking' ),
		canonicalName = mw.config.get( 'wgCanonicalSpecialPageName' ),
		pageName = canonicalName === 'EditWatchlist' || canonicalName === 'Watchlist' ? 'watchlist' : 'diff',
		subPageName = mw.util.getParamValue( 'watchlistview' ) || 'a-z';

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
				wlSchema.log( {
					name: actionNamePrefix + 'unwatch'
				} );
			} );
			watchlist.on( 'watch', function () {
				wlSchema.log( {
					name: actionNamePrefix + 'watch'
				} );
			} );
		}
		// not needed now we have JS view which has infinite scrolling
		$( '.more' ).remove();

		// Register EventLogging events
		wlSchema.hijackLink( '.button-bar a', actionNamePrefix + 'switch' );
		wlSchema.hijackLink( '.mw-mf-watchlist-selector a', actionNamePrefix + 'filter' );
		wlSchema.hijackLink( '.page-list .title', actionNamePrefix + 'view' );
	}

	$( function () {
		init();
	} );

} )( mw.mobileFrontend, jQuery );
