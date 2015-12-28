( function ( M, $ ) {
	var limit = 50,
		Page = M.require( 'mobile.startup/Page' ),
		ns = mw.config.get( 'wgMFContentNamespace' );

	/**
	 * FIXME: Api should surely know this and return it in response to save us the hassle
	 * FIXME: Add some tests :)
	 * Apply the Haversine formula ( https://en.wikipedia.org/wiki/Haversine_formula ) and calculate the distance
	 * between two points as the crow flies.
	 * @method
	 * @ignore
	 * @param {Object} from with latitude and longitude keys
	 * @param {Object} to with latitude and longitude keys
	 * @return {Number} distance in kilometers
	 */
	function calculateDistance( from, to ) {
		var distance, a,
			toRadians = Math.PI / 180,
			deltaLat, deltaLng,
			startLat, endLat,
			haversinLat, haversinLng,
			radius = 6378; // radius of Earth in km

		if ( from.latitude === to.latitude && from.longitude === to.longitude ) {
			distance = 0;
		} else {
			deltaLat = ( to.longitude - from.longitude ) * toRadians;
			deltaLng = ( to.latitude - from.latitude ) * toRadians;
			startLat = from.latitude * toRadians;
			endLat = to.latitude * toRadians;

			haversinLat = Math.sin( deltaLat / 2 ) * Math.sin( deltaLat / 2 );
			haversinLng = Math.sin( deltaLng / 2 ) * Math.sin( deltaLng / 2 );

			a = haversinLat + Math.cos( startLat ) * Math.cos( endLat ) * haversinLng;
			return 2 * radius * Math.asin( Math.sqrt( a ) );
		}
		return distance;
	}

	/**
	 * API for retrieving nearby pages
	 * @class NearbyGateway
	 * @param {Object} options
	 * @param {mw.Api} options.api
	 */
	function NearbyGateway( options ) {
		this.api = options.api;
	}

	NearbyGateway.prototype = {
		/**
		 * Returns a human readable string stating the distance in meters or kilometers
		 * depending on size.
		 * @method
		 * @private
		 * @param {Number} d The distance in meters.
		 * @return {String} message stating how far the user is from the point of interest.
		 */
		_distanceMessage: function ( d ) {
			var msg = 'mobile-frontend-nearby-distance';
			if ( d < 1 ) {
				d *= 100;
				d = Math.ceil( d ) * 10;
				if ( d === 1000 ) {
					d = 1;
				} else {
					msg = 'mobile-frontend-nearby-distance-meters';
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
			return mw.msg( msg, mw.language.convertNumber( d ) );
		},
		/**
		 * Returns a list of pages around a given point
		 * @method
		 * @param {Object} coords In form { latitude: 0, longitude: 2 }
		 * @param {Number} range Number of meters to perform a geosearch for
		 * @param {String} exclude Name of a title to exclude from the list of results
		 * @return {jQuery.Deferred} Object taking list of pages as argument
		 */
		getPages: function ( coords, range, exclude ) {
			return this._search( {
				ggscoord: [ coords.latitude, coords.longitude ]
			}, range, exclude );
		},

		/**
		 * Gets the pages around a page. It excludes itself from the search
		 * @method
		 * @param {String} page Page title like "W_San_Francisco"
		 * @param {Number} range Number of meters to perform a geosearch for
		 * @return {jQuery.Deferred} Object taking list of pages as argument
		 */
		getPagesAroundPage: function ( page, range ) {
			return this._search( {
				ggspage: page
			}, range, page );
		},

		/**
		 * Searches for pages nearby
		 * @method
		 * @private
		 * @param {Object} params Parameters to use for searching
		 * @param {Number} range Number of meters to perform a geosearch for
		 * @param {String} exclude Name of a title to exclude from the list of results
		 * @return {jQuery.Deferred} Object taking list of pages as argument
		 */
		_search: function ( params, range, exclude ) {
			var loc, requestParams,
				d = $.Deferred(),
				self = this;

			requestParams = {
				colimit: 'max',
				prop: [ 'coordinates' ].concat( mw.config.get( 'wgMFQueryPropModules' ) ),
				generator: 'geosearch',
				ggsradius: range,
				ggsnamespace: ns,
				ggslimit: limit,
				formatversion: 2
			};
			$.extend( requestParams, params, mw.config.get( 'wgMFSearchAPIParams' ) );

			this.api.ajax( requestParams ).then( function ( resp ) {
				var pages;
				if ( resp.query ) {
					pages = resp.query.pages || [];
				} else {
					pages = [];
				}

				// If we have coordinates then set them so that the results are sorted by
				// distance
				if ( params.ggscoord ) {
					loc = {
						latitude: params.ggscoord[0],
						longitude: params.ggscoord[1]
					};
				}
				// If we have no coords (searching for a page's nearby), find the
				// page in the results and get its coords.
				if ( params.ggspage ) {
					$.each( pages, function ( i, page ) {
						if ( params.ggspage === page.title ) {
							loc = {
								latitude: page.coordinates[0].lat,
								longitude: page.coordinates[0].lon
							};
						}
					} );
				}

				pages = $.map( pages, function ( page, i ) {
					var coords, lngLat, p;
					p = Page.newFromJSON( page );
					p.anchor = 'item_' + i;
					if ( page.coordinates && loc ) { // FIXME: protect against bug 47133 (remove when resolved)
						coords = page.coordinates[0];
						lngLat = {
							latitude: coords.lat,
							longitude: coords.lon
						};
						// FIXME: Make part of the Page object
						p.dist = calculateDistance( loc, lngLat );
						p.latitude = coords.lat;
						p.longitude = coords.lon;
						p.proximity = self._distanceMessage( p.dist );
					} else {
						p.dist = 0;
					}
					if ( exclude !== page.title ) {
						return p;
					}
				} );

				pages.sort( function ( a, b ) {
					return a.dist > b.dist ? 1 : -1;
				} );
				d.resolve( pages );
			}, function ( error, details ) {
				if ( details && details.error && details.error.info ) {
					d.reject( error, details.error.info );
				} else {
					d.reject( error, '' );
				}
			} );

			return d;
		}
	};

	M.define( 'mobile.nearby/NearbyGateway', NearbyGateway );
}( mw.mobileFrontend, jQuery ) );
