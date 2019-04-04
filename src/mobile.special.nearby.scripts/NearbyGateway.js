var limit = 50,
	pageJSONParser = require( '../mobile.startup/page/pageJSONParser' ),
	ns = mw.config.get( 'wgContentNamespaces' ),
	util = require( '../mobile.startup/util' ),
	extendSearchParams = require( '../mobile.startup/extendSearchParams' );

/**
 * API for retrieving nearby pages
 * @class NearbyGateway
 * @param {Object} options Configuration options
 * @param {mw.Api} options.api
 */
function NearbyGateway( options ) {
	this.api = options.api;
}

NearbyGateway.prototype = {
	/**
	 * Returns a human readable string stating the distance in meters or kilometers
	 * depending on size.
	 * @memberof NearbyGateway
	 * @instance
	 * @private
	 * @param {number} d The distance in meters.
	 * @return {string} message stating how far the user is from the point of interest.
	 */
	_distanceMessage: function ( d ) {
		if ( d < 1 ) {
			d *= 100;
			d = Math.ceil( d ) * 10;
			if ( d === 1000 ) {
				d = 1;
			} else {
				return mw.msg( 'mobile-frontend-nearby-distance-meters', mw.language.convertNumber( d ) );
			}
		} else {
			if ( d > 2 ) {
				d *= 10;
				d = Math.ceil( d ) / 10;
				d = d.toFixed( 1 );
			} else {
				d *= 100;
				d = Math.ceil( d ) / 100;
				d = d.toFixed( 2 );
			}
		}
		return mw.msg( 'mobile-frontend-nearby-distance', mw.language.convertNumber( d ) );
	},
	/**
	 * Returns a list of pages around a given point
	 * @memberof NearbyGateway
	 * @instance
	 * @param {Object} coords In form { latitude: 0, longitude: 2 }
	 * @param {number} range Number of meters to perform a geosearch for
	 * @param {string} exclude Name of a title to exclude from the list of results
	 * @return {jQuery.Deferred} Object taking list of pages as argument
	 */
	getPages: function ( coords, range, exclude ) {
		return this._search( {
			ggscoord: [ coords.latitude, coords.longitude ]
		}, range, exclude );
	},

	/**
	 * Gets the pages around a page. It excludes itself from the search
	 * @memberof NearbyGateway
	 * @instance
	 * @param {string} page Page title like "W_San_Francisco"
	 * @param {number} range Number of meters to perform a geosearch for
	 * @return {jQuery.Deferred} Object taking list of pages as argument
	 */
	getPagesAroundPage: function ( page, range ) {
		return this._search( {
			ggspage: page
		}, range, page );
	},

	/**
	 * Searches for pages nearby
	 * @memberof NearbyGateway
	 * @instance
	 * @private
	 * @param {Object} params Parameters to use for searching
	 * @param {number} range Number of meters to perform a geosearch for
	 * @param {string} [exclude] Name of a title to exclude from the list of results
	 * @return {jQuery.Deferred} Object taking list of pages as argument
	 */
	_search: function ( params, range, exclude ) {
		var requestParams,
			d = util.Deferred(),
			self = this;

		requestParams = extendSearchParams( 'nearby', {
			colimit: 'max',
			prop: [ 'coordinates' ],
			generator: 'geosearch',
			ggsradius: range,
			ggsnamespace: ns,
			ggslimit: limit
		}, params );

		if ( params.ggscoord ) {
			requestParams.codistancefrompoint = params.ggscoord;
		} else if ( params.ggspage ) {
			requestParams.codistancefrompage = params.ggspage;
		}

		this.api.ajax( requestParams ).then( function ( resp ) {
			var pages;

			// resp.query.pages is an Array<Page> instead of a map like in other
			// API requests
			if ( resp.query ) {
				pages = resp.query.pages || [];
			} else {
				pages = [];
			}

			pages = pages.map( function ( page, i ) {
				var coords, p;
				p = pageJSONParser.parse( page );
				p.anchor = 'item_' + i;

				// protect against declined bug T49133
				if ( page.coordinates ) {
					coords = page.coordinates[0];
					// FIXME: Make part of the Page object
					p.dist = coords.dist / 1000;
					p.latitude = coords.lat;
					p.longitude = coords.lon;
					p.proximity = self._distanceMessage( p.dist );
				} else {
					p.dist = 0;
				}
				if ( exclude !== page.title ) {
					return p;
				} else {
					return null;
				}
			} ).filter( function ( page ) { return !!page; } );

			pages.sort( function ( a, b ) {
				return a.dist > b.dist ? 1 : -1;
			} );
			if ( pages.length === 0 ) {
				d.reject( 'empty' );
			} else {
				d.resolve( pages );
			}
		}, function ( error ) {
			d.reject( error );
		} );
		return d;
	}
};

module.exports = NearbyGateway;
