const
	pageJSONParser = require( './pageJSONParser' ),
	util = require( '../mobile.startup/util' ),
	extendSearchParams = require( './extendSearchParams' );

/**
 * API for interacting with watchlist.
 */
class WatchListGateway {
	/**
	 * @param {mw.Api} api
	 * @param {string} lastTitle of page listed in Watchlist to be used as a continuation parameter
	 * @private
	 */
	constructor( api, lastTitle ) {
		this.api = api;
		// Try to keep it in sync with SpecialMobileEditWatchlist::LIMIT (php)
		this.limit = 50;

		if ( lastTitle ) {
			this.continueParams = {
				continue: 'gwrcontinue||',
				gwrcontinue: '0|' + lastTitle.replace( / /g, '_' )
			};
			this.shouldSkipFirstTitle = true;
		} else {
			this.continueParams = {
				continue: ''
			};
			this.shouldSkipFirstTitle = false;
		}

		this.canContinue = true;
	}

	/**
	 * Load the list of items on the watchlist
	 *
	 * @return {jQuery.Deferred}
	 */
	loadWatchlist() {
		const params = extendSearchParams( 'watchlist', {
			prop: [ 'info', 'revisions' ],
			rvprop: 'timestamp|user',
			generator: 'watchlistraw',
			gwrnamespace: '0',
			gwrlimit: this.limit
		}, this.continueParams );

		if ( this.canContinue === false ) {
			return util.Deferred().resolve( [] );
		}
		return this.api.get( params ).then( ( data ) => {
			if ( data.continue !== undefined ) {
				this.continueParams = data.continue;
			} else {
				this.canContinue = false;
			}

			return this.parseData( data );
		} );
	}

	/**
	 * Parse api response data into pagelist item format
	 *
	 * @param {Object[]} data
	 * @return {Page[]}
	 */
	parseData( data ) {
		let pages;

		if ( !data.query || !data.query.pages ) {
			return [];
		}

		pages = data.query.pages;

		// Sort results alphabetically (the api map doesn't have any order). The
		// watchlist is ordered alphabetically right now.
		pages.sort( ( p1, p2 ) => p1.title === p2.title ? 0 : ( p1.title < p2.title ? -1 : 1 ) );

		// If we requested from the last item of the previous page, we shall
		// remove the first result (to avoid it being repeated)
		if ( this.shouldSkipFirstTitle ) {
			pages = pages.slice( 1 );
			this.shouldSkipFirstTitle = false;
		}

		// Transform the items to a sensible format
		return pages.map( pageJSONParser.parse );
	}
}

module.exports = WatchListGateway;
