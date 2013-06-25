( function( M, $ ) {
var CACHE_KEY_RESULTS = 'mfNearbyLastSearchResult',
	endpoint = mw.config.get( 'wgMFNearbyEndpoint' ),
	ns = mw.config.get( 'wgMFNearbyNamespace' ),
	overlay,
	CACHE_KEY_LAST_LOCATION = 'mfNearbyLastKnownLocation';

function getOverlay() {
	return overlay;
}

function distanceMessage( d ) {
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
}

$( function() {
	var supported = M.supportsGeoLocation(),
		View = M.require( 'view' ),
		$userBtn = $( '#user-button' ),
		errorMessages = {
			empty: {
				heading: mw.msg( 'mobile-frontend-nearby-noresults' ),
				guidance: mw.msg( 'mobile-frontend-nearby-noresults-guidance' )
			},
			location: {
				heading: mw.msg( 'mobile-frontend-nearby-lookup-ui-error' ),
				guidance: mw.msg( 'mobile-frontend-nearby-lookup-ui-error-guidance' )
			},
			server: {
				heading: mw.msg( 'mobile-frontend-nearby-error' ),
				guidance: mw.msg( 'mobile-frontend-nearby-error-guidance' )
			},
			// recycle it's already in html
			incompatible: {
				heading: $( '#mw-mf-nearby .noscript h2' ).text(),
				guidance: $( '#mw-mf-nearby .noscript p' ).text()
			}
		},
		curLocation,
		lastKnownLocation = M.settings.getUserSetting( CACHE_KEY_LAST_LOCATION ),
		cache = M.settings.saveUserSetting,
		lastSearchResult = M.settings.getUserSetting( CACHE_KEY_RESULTS ),
		Nearby = View.extend( {
			template: M.template.get( 'articleList' ),
			/**
			 * Renders an error in the existing view
			 *
			 * @param {String} type A string that identifies a particular type of error message
			 */
			renderError: function( type ) {
				this.render( { error: errorMessages[ type ] } );
			},
			openPage: function( ev ) {
				// help back button work
				window.location.hash = '#' + $( ev.currentTarget ).attr( 'name' );
				window.location = $( ev.currentTarget ).attr( 'href' );
			},
			postRender: function() {
				var self = this;
				this.$( 'a' ).on( 'mousedown', function( ev ) {
					// name funnel for watchlists to catch subsequent uploads
					$.cookie( 'mwUploadsFunnel', 'nearby', { expires: new Date( new Date().getTime() + 60000) } );
					self.openPage( ev );
				} );
				self.emit( 'rendered', this.$el );
			}
		} ),
		pendingQuery = false, btn;

		overlay = new Nearby( {
			el: $( '#mw-mf-nearby' )
		} );

	// FIXME: Api should surely know this and return it in response to save us the hassle
	// haversine formula ( http://en.wikipedia.org/wiki/Haversine_formula )
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

	function render( $content, pages ) {
		cache( CACHE_KEY_RESULTS, $.toJSON( pages ) ); // cache result
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
				coords = page.coordinates[0],
				lngLat = { latitude: coords.lat, longitude: coords.lon };
				page.dist = calculateDistance( curLocation, lngLat );
				page.latitude = coords.lat;
				page.longitude = coords.lon;
				page.proximity = distanceMessage( page.dist );
			}
			page.heading = page.title;
			pages.push( page );
			return page;
		} );
		pages.sort( function( a, b ) {
			return a.dist > b.dist ? 1 : -1;
		} );

		overlay.render( {
			pages: pages
		} );
	}

	function findResults( lat, lng ) {
		var $content = $( '#mw-mf-nearby' ), range = mw.config.get( 'wgMFNearbyRange' ),
			limit = 50;

		$.ajax( {
			dataType: endpoint ? 'jsonp' : 'json',
			url: endpoint || M.getApiUrl(),
			data: {
				action: 'query',
				colimit: 'max',
				prop: 'pageimages|coordinates',
				pithumbsize: 180,
				pilimit: limit,
				generator: 'geosearch',
				format: 'json',
				ggscoord: lat + '|' + lng,
				ggsradius: range,
				ggsnamespace: ns,
				ggslimit: limit
			}
		} ).done( function( data ) {
			var pages;
			// FIXME: API bug 48512
			if ( data.query ) {
				pages = data.query.pages || {};
			} else {
				pages = {};
			}
			// FIXME: API returns object when array would make much sense
			pages = $.map( pages , function( i ) {
				return i;
			} );
			if ( pages.length > 0 ) {
				render( $content, pages );
			} else {
				overlay.renderError( 'empty' );
			}
		} ).fail( function() {
			overlay.renderError( 'server' );
		} );
	}

	function completeRefresh() {
		$( 'button.refresh' ).removeClass( 'refreshing' );
		pendingQuery = false;
	}

	function init() {
		var $content = $( '#mw-mf-nearby' ).empty();
		$( '<div class="content loading"> ').text(
			mw.msg( 'mobile-frontend-nearby-loading' ) ).appendTo( $content );
		navigator.geolocation.getCurrentPosition( function( geo ) {
			var lat = geo.coords.latitude, lng = geo.coords.longitude;
			curLocation = { latitude: lat, longitude: lng }; // save as json so it can be cached bug 48268
			cache( CACHE_KEY_LAST_LOCATION, $.toJSON( curLocation ) );
			findResults( lat, lng );
			completeRefresh();
		},
		function() {
			overlay.renderError( 'location' );
			completeRefresh();
		},
		{
			timeout: 10000,
			enableHighAccuracy: true
		} );
	}

	function refresh() {
		if ( pendingQuery ) {
			return;
		} else {
			$( 'button.refresh' ).addClass( 'refreshing' );
			pendingQuery = true;
			init();
		}
	}

	if ( supported ) {
		if ( lastKnownLocation ) {
			curLocation = $.parseJSON( lastKnownLocation );
			if ( !curLocation.latitude ) { // Fix damage caused by bug 48268 which will throw an error in watchPosition handler
				curLocation = false;
			}
		}
		if ( lastSearchResult && window.location.hash ) {
			render( $( '#content' ), $.parseJSON( lastSearchResult ) );
		} else {
			init();
		}
	} else {
		overlay.renderError( 'incompatible' );
	}

	if ( $userBtn.length ) {
		$( '<ul id="mw-mf-menu-page">' ).insertAfter( $userBtn );
		$userBtn.remove();
	}
	btn = $( '<li><button class="refresh">refresh</button></li>' ).on( 'click', refresh ).appendTo( '#mw-mf-menu-page' );
} );

M.define( 'nearby', {
	distanceMessage: distanceMessage,
	endpoint: endpoint,
	getOverlay: getOverlay
} );


}( mw.mobileFrontend, jQuery ) );
