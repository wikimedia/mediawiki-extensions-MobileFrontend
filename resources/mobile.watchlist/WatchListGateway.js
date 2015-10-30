( function ( M, $ ) {
	var Page = M.require( 'mobile.startup/Page' );

	/**
	 * @class WatchListGateway
	 * @param {mw.Api} api
	 * @param {String} lastTitle of page listed in Watchlist to be used as a continuation parameter
	 */
	function WatchListGateway( api, lastTitle ) {
		this.api = api;
		// Try to keep it in sync with SpecialMobileWatchlist::LIMIT (php)
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

	WatchListGateway.prototype = {
		/**
		 * Load the list of items on the watchlist
		 * @returns {jQuery.Deferred}
		 */
		loadWatchlist: function () {
			var self = this,
				params = $.extend( {
					prop: [ 'info', 'revisions' ].concat( mw.config.get( 'wgMFQueryPropModules' ) ),
					format: 'json',
					formatversion: 2,
					rvprop: 'timestamp|user',
					generator: 'watchlistraw',
					gwrnamespace: '0',
					gwrlimit: this.limit
				}, mw.config.get( 'wgMFSearchAPIParams' ), this.continueParams );

			if ( this.canContinue === false ) {
				return $.Deferred();
			}
			if ( this.shouldSkipFirstTitle ) {
				// If we are calling the api from the last item of the previous page
				// (like the first time when grabbing the last title from the HTML),
				// then request one extra element (make room for that last title) which
				// will be removed later when parsing data.
				params.gwrlimit += 1;
				params.pilimit += 1;
			}
			return this.api.get( params, {
				url: this.apiUrl
			} ).then( function ( data ) {
				if ( data.hasOwnProperty( 'continue' ) ) {
					self.continueParams = data.continue;
				} else {
					self.canContinue = false;
				}

				return self.parseData( data );
			} );
		},

		/**
		 * Parse api response data into pagelist item format
		 * @param {Object[]} data
		 * @return {Page[]}
		 */
		parseData: function ( data ) {
			var pages;

			if ( !data.hasOwnProperty( 'query' ) || !data.query.hasOwnProperty( 'pages' ) ) {
				return [];
			}

			// Convert the map to an Array.
			pages = $.map( data.query.pages, function ( page ) {
				return page;
			} );

			// Sort results alphabetically (the api map doesn't have any order). The
			// watchlist is ordered alphabetically right now.
			pages.sort( function ( p1, p2 ) {
				return p1.title === p2.title ? 0 : ( p1.title < p2.title ? -1 : 1 );
			} );

			// If we requested from the last item of the previous page, we shall
			// remove the first result (to avoid it being repeated)
			if ( this.shouldSkipFirstTitle ) {
				pages = pages.slice( 1 );
				this.shouldSkipFirstTitle = false;
			}

			// Transform the items to a sensible format
			return $.map( pages, function ( item ) {
				return Page.newFromJSON( item );
			} );
		}

	};

	M.define( 'mobile.watchlist/WatchListGateway', WatchListGateway );

}( mw.mobileFrontend, jQuery ) );
