( function( M, $ ) {

( function() {
	var supported = M.supportsGeoLocation(),
		popup = M.require( 'notifications' ),
		View = M.require( 'view' ),
		cachedPages,
		curLocation,
		Nearby = View.extend( {
			template: M.template.get( 'articleList' )
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

	function render( $content, pages ) {
		pages = $.map( pages, function( page ) {
			var coords, lngLat, thumb;

			if ( page.thumbnail ) {
				thumb = page.thumbnail;
				page.listThumbStyleAttribute = 'background-image: url(' + thumb.source + ')';
				page.pageimageClass = thumb.width > thumb.height ? 'listThumbH' : 'listThumbV';
			} else {
				page.pageimageClass = 'needsPhoto';
			}
			page.url = M.history.getArticleUrl( page.title );
			if ( page.coordinates ) { // FIXME: protect against bug 47133 (remove when resolved)
				coords = page.coordinates[0],
				lngLat = { latitude: coords.lat, longitude: coords.lon };
				page.dist = calculateDistance( curLocation, lngLat );
				page.proximity = distanceMessage( page.dist );
			}
			pages.push( page );
			return page;
		} );
		pages.sort( function( a, b ) {
			return a.dist > b.dist ? 1 : -1;
		} );

		new Nearby( {
			el: $content[0],
			pages: pages
		} );
		$content.find( 'a' ).on( 'mousedown', function() {
			// name funnel for watchlists to catch subsequent uploads
			$.cookie( 'mwUploadsFunnel', 'nearby', { expires: new Date( new Date().getTime() + 60000) } );
		} );
	}

	function findResults( lat, lng ) {
		var $content = $( '#mw-mf-nearby' ), range = 10000, endpoint = mw.config.get( 'wgMFNearbyEndpoint' ),
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
				ggsnamespace: 0,
				ggslimit: limit
			}
		} ).done( function( data ) {
			var pages = $.map( data.query.pages, function( i ) {
				return i;
			} ), $popup;
			if ( pages.length > 0 ) {
				if ( !cachedPages ) {
					render( $content, pages );
				} else {
					$popup = popup.show(
						mw.message( 'mobile-frontend-nearby-refresh' ).plain(), 'toast locked' );
					$popup.click( function() {
						render( $content, pages );
						popup.close( true );
					} );
				}

				cachedPages = pages;
			} else {
				$content.empty();
				$( '<div class="empty content">' ).
					text( mw.message( 'mobile-frontend-nearby-noresults' ).plain() ).
					appendTo( $content );
			}
		} ).error( function() {
			$( '#mw-mf-nearby' ).addClass( 'alert error content' ).text( mw.message( 'mobile-frontend-nearby-error' ) );
		} );
	}

	function init() {
		var $content = $( '#mw-mf-nearby' ).empty();
		$( '<div class="content loading"> ').text(
			mw.message( 'mobile-frontend-nearby-loading' ) ).appendTo( $content );
		navigator.geolocation.watchPosition( function( geo ) {
			var lat = geo.coords.latitude, lng = geo.coords.longitude;
			curLocation = geo.coords;
			findResults( lat, lng );
		},
		function() {
			popup.show( mw.message( 'mobile-frontend-nearby-lookup-error' ).plain(), 'toast' );
		},
		{
			enableHighAccuracy: true
		} );
	}

	if ( supported ) {
		init();
	}
	M.define( 'nearby', {
		distanceMessage: distanceMessage
	} );
}() );


}( mw.mobileFrontend, jQuery ) );
