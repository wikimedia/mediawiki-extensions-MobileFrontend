( function( M, $ ) {

( function() {
	var supported = !!navigator.geolocation,
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

	function render( $content, pages ) {
		pages = $.map( pages, function( page ) {
			var coords, lngLat;

			if ( page.coordinates ) { // FIXME: protecting us against an api bug 47133
				if ( page.thumbnail ) {
					page.pageimage = page.thumbnail.source;
				}
				page.url = M.history.getArticleUrl( page.title );

				coords = page.coordinates[0],
				lngLat = { latitude: coords.lat, longitude: coords.lon };
				page.dist = calculateDistance( curLocation, lngLat );
				page.proximity = mw.message( 'mobile-frontend-nearby-distance',
					page.dist.toFixed( 2 ) );
				pages.push( page );
				return page;
			}
		} );
		pages.sort( function( a, b ) {
			return a.dist > b.dist ? 1 : -1;
		} );

		new Nearby( {
			el: $content[0],
			pages: pages
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
}() );


}( mw.mobileFrontend, jQuery ) );
