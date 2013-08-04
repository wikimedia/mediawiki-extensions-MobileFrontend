( function( M, $ ) {
	var
		endpoint = mw.config.get( 'wgMFNearbyEndpoint' ),
		limit = 50,
		ns = mw.config.get( 'wgMFNearbyNamespace' ),
		Api = M.require( 'api' ).Api,
		NearbyApi;

	// FIXME: Api should surely know this and return it in response to save us the hassle
	// FIXME: Add some tests :)
	// haversine formula ( https://en.wikipedia.org/wiki/Haversine_formula )
	function calculateDistance( from, to ) {
		var distance, a,
			toRadians = Math.PI / 180,
			deltaLat, deltaLng,
			startLat, endLat,
			haversinLat, haversinLng,
			radius = 6378; // radius of Earth in km

		if( from.latitude === to.latitude && from.longitude === to.longitude ) {
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

	NearbyApi = Api.extend( {
		_distanceMessage: function( d ) {
			var msg = 'mobile-frontend-nearby-distance';
			if ( d < 1 ) {
				d *= 100;
				d = Math.ceil( d ) * 10;
				if ( d === 1000 ) {
					d = 1;
				} else {
					msg = 'mobile-frontend-nearby-distance-meters';
				}
				d = d + '';
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
			return mw.msg( msg, d );
		},
		getPages: function( location, range ) {
			var d = $.Deferred(), self = this;
			this.get( {
				action: 'query',
				colimit: 'max',
				prop: 'pageimages|coordinates',
				pithumbsize: 180,
				pilimit: limit,
				generator: 'geosearch',
				ggscoord: [ location.latitude, location.longitude ],
				ggsradius: range,
				ggsnamespace: ns,
				ggslimit: limit
			},
			{
				dataType: endpoint ? 'jsonp' : 'json',
				url: endpoint || M.getApiUrl()
			} ).then( function( resp ) {
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
				pages = $.map( pages , function( i ) {
					return i;
				} );
				pages = $.map( pages, function( page, i ) {
					var coords, lngLat, thumb;

					if ( page.thumbnail ) {
						thumb = page.thumbnail;
						page.listThumbStyleAttribute = 'background-image: url(' + thumb.source + ')';
						page.pageimageClass = thumb.width > thumb.height ? 'listThumbH' : 'listThumbV';
					} else {
						page.pageimageClass = 'needsPhoto';
					}
					page.anchor = 'item_' + i;
					page.url = M.history.getArticleUrl( page.title );
					if ( page.coordinates ) { // FIXME: protect against bug 47133 (remove when resolved)
						coords = page.coordinates[0];
						lngLat = { latitude: coords.lat, longitude: coords.lon };
						page.dist = calculateDistance( location, lngLat );
						page.latitude = coords.lat;
						page.longitude = coords.lon;
						page.proximity = self._distanceMessage( page.dist );
					}
					page.heading = page.title;
					pages.push( page );
					return page;
				} );

				pages.sort( function( a, b ) {
					return a.dist > b.dist ? 1 : -1;
				} );
				d.resolve( pages );
			} );
			return d;
		}
	} );

	M.define( 'modules/nearby/NearbyApi', NearbyApi );
}( mw.mobileFrontend, jQuery ) );
