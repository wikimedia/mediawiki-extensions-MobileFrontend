( function( M, $ ) {
var CACHE_KEY_RESULTS = 'mfNearbyLastSearchResult',
	CACHE_KEY_LAST_LOCATION = 'mfNearbyLastKnownLocation';

( function() {
	var supported = M.supportsGeoLocation(),
		watchstar = M.require( 'watchstar' ),
		popup = M.require( 'notifications' ),
		nav = M.require( 'navigation' ),
		View = M.require( 'view' ),
		endpoint = mw.config.get( 'wgMFNearbyEndpoint' ),
		curLocation,
		lastKnownLocation = M.settings.getUserSetting( CACHE_KEY_LAST_LOCATION ),
		cache = M.settings.saveUserSetting,
		lastSearchResult = M.settings.getUserSetting( CACHE_KEY_RESULTS ),
		inAlpha = mw.config.get( 'wgMFMode' ) === 'alpha', // FIXME: sandbox before pushing nearby to stable
		Nearby = View.extend( {
			template: M.template.get( 'articleList' ),
			initialize: function() {
				var self = this;
				this.$( 'a' ).on( 'mousedown', function( ev ) {
					// name funnel for watchlists to catch subsequent uploads
					$.cookie( 'mwUploadsFunnel', 'nearby', { expires: new Date( new Date().getTime() + 60000) } );
					self.emit( 'page-click', ev );
				} );
				if ( inAlpha ) {
					watchstar.initWatchListIconList( this.$( 'ul' ) );
				}
			}
		} ),
		pendingQuery = false, btn, menu,
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
		cache( CACHE_KEY_RESULTS, $.toJSON( pages ) ); // cache result
		pages = $.map( pages, function( page ) {
			var coords, lngLat, thumb;

			if ( page.thumbnail ) {
				thumb = page.thumbnail;
				page.listThumbStyleAttribute = 'background-image: url(' + thumb.source + ')';
				page.pageimageClass = thumb.width > thumb.height ? 'listThumbH' : 'listThumbV';
			} else {
				page.pageimageClass = 'needsPhoto';
				page.cta = mw.msg( 'mobile-frontend-needs-photo' );
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

		overlay.render( {
			pages: pages
		} );
	}

	function findResults( lat, lng ) {
		var $content = $( '#mw-mf-nearby' ), range = 10000,
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
			} );
			if ( pages.length > 0 ) {
				render( $content, pages );
			} else {
				$content.empty();
				$( '<div class="empty content">' ).
					text( mw.message( 'mobile-frontend-nearby-noresults' ).plain() ).
					appendTo( $content );
			}
		} ).fail( function() {
			$( '#mw-mf-nearby' ).addClass( 'alert error content' ).text( mw.message( 'mobile-frontend-nearby-error' ) );
		} );
	}

	function completeRefresh() {
		$( 'button.refresh' ).removeClass( 'refreshing' );
		pendingQuery = false;
	}

	function init() {
		var $content = $( '#mw-mf-nearby' ).empty();
		$( '<div class="content loading"> ').text(
			mw.message( 'mobile-frontend-nearby-loading' ) ).appendTo( $content );
		navigator.geolocation.getCurrentPosition( function( geo ) {
			var lat = geo.coords.latitude, lng = geo.coords.longitude;
			curLocation = { latitude: lat, longitude: lng }; // save as json so it can be cached bug 48268
			cache( CACHE_KEY_LAST_LOCATION, $.toJSON( curLocation ) );
			findResults( lat, lng );
			completeRefresh();
		},
		function() {
			popup.show( mw.message( 'mobile-frontend-nearby-lookup-error' ).plain(), 'toast' );
			completeRefresh();
		},
		{
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
		init();
		if ( lastSearchResult ) {
			render( $( '#content' ), $.parseJSON( lastSearchResult ) );
		}
	}

	menu = $( '<li>' ).appendTo( nav.getPageMenu() );
	btn = $( '<button class="refresh">refresh</button></li>' ).on( 'click', refresh ).appendTo( menu );

	M.define( 'nearby', {
		distanceMessage: distanceMessage,
		endpoint: endpoint,
		overlay: overlay
	} );
}() );


}( mw.mobileFrontend, jQuery ) );
