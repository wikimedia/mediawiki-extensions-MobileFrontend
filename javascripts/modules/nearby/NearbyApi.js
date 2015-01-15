( function ( M, $ ) {

	var Api, NearbyApi,
		endpoint = mw.config.get( 'wgMFNearbyEndpoint' ),
		limit = 50,
		ns = mw.config.get( 'wgMFContentNamespace' );

	if ( endpoint ) {
		Api = M.require( 'modules/ForeignApi' );
	} else {
		Api = M.require( 'api' ).Api;
	}

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
	 * @class NearbyApi
	 * @extends Api
	 */
	NearbyApi = Api.extend( {
		apiUrl: endpoint || Api.prototype.apiUrl,
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
				action: 'query',
				colimit: 'max',
				prop: 'pageimages|coordinates',
				pithumbsize: mw.config.get( 'wgMFThumbnailSizes' ).small,
				pilimit: limit,
				generator: 'geosearch',
				ggsradius: range,
				ggsnamespace: ns,
				ggslimit: limit
			};
			$.extend( requestParams, params );

			this.ajax( requestParams ).then( function ( resp ) {
				var pages;
				// FIXME: API bug 48512
				if ( !resp || resp.error ) {
					return d.reject( resp );
				} else if ( resp.query ) {
					pages = resp.query.pages || {};
				} else {
					pages = {};
				}

				// FIXME: API returns object when array would make much sense
				pages = $.map( pages, function ( i ) {
					return i;
				} );

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

				// Process the pages
				pages = $.map( pages, function ( page, i ) {
					var coords, lngLat, thumb;

					if ( page.thumbnail ) {
						thumb = page.thumbnail;
						page.listThumbStyleAttribute = 'background-image: url(' + thumb.source + ')';
						page.pageimageClass = thumb.width > thumb.height ? 'list-thumb-y' : 'list-thumb-x';
					} else {
						page.pageimageClass = 'list-thumb-none list-thumb-x';
					}
					page.anchor = 'item_' + i;
					page.url = mw.util.getUrl( page.title );
					if ( page.coordinates && loc ) { // FIXME: protect against bug 47133 (remove when resolved)
						coords = page.coordinates[0];
						lngLat = {
							latitude: coords.lat,
							longitude: coords.lon
						};
						page.dist = calculateDistance( loc, lngLat );
						page.latitude = coords.lat;
						page.longitude = coords.lon;
						page.proximity = self._distanceMessage( page.dist );
					} else {
						page.dist = 0;
					}
					page.id = page.pageid;
					page.heading = page.title;
					if ( exclude !== page.title ) {
						return page;
					}
				} );

				pages.sort( function ( a, b ) {
					return a.dist > b.dist ? 1 : -1;
				} );
				d.resolve( pages );
			} );

			return d;
		}

	} );

	M.define( 'modules/nearby/NearbyApi', NearbyApi );
}( mw.mobileFrontend, jQuery ) );
