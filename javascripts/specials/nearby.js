( function( M, $ ) {
var CACHE_KEY_RESULTS = 'mfNearbyLastSearchResult',
	PRECISION = 2,
	CACHE_KEY_LAST_LOCATION = 'mfNearbyLastKnownLocation';

( function() {
	var supported = M.supportsGeoLocation(),
		popup = M.require( 'notifications' ),
		Overlay = M.require( 'navigation' ).Overlay,
		View = M.require( 'view' ),
		Page = M.require( 'page' ),
		endpoint = mw.config.get( 'wgMFNearbyEndpoint' ),
		cachedPages,
		curLocation,
		lastKnownLocation = M.settings.getUserSetting( CACHE_KEY_LAST_LOCATION ),
		cache = M.settings.saveUserSetting,
		lastSearchResult = M.settings.getUserSetting( CACHE_KEY_RESULTS ),
		LoadingOverlay = Overlay.extend( {
			defaults: {
				msg: mw.msg( 'mobile-frontend-ajax-preview-loading' )
			},
			template: M.template.get( 'overlays/loading' )
		} ),
		PagePreviewOverlay = Overlay.extend( {
			template: M.template.get( 'overlays/pagePreview' ),
			preRender: function( options ) {
				options.heading = options.page.heading;
				options.content = options.page.lead;
				options.url = M.history.getArticleUrl( options.heading );
				options.readMoreLink = mw.msg( 'mobile-frontend-nearby-link' );
			},
			initialize: function( options ) {
				this._super( options );
				this.$( '.content table' ).remove();
			}
		} ),
		Nearby = View.extend( {
			template: M.template.get( 'articleList' ),
			initialize: function() {
				this.$( 'a' ).on( 'mousedown', function() {
					var loader = new LoadingOverlay(),
						title = $( this ).find( 'h2' ).text();
					loader.show();

					// name funnel for watchlists to catch subsequent uploads
					$.cookie( 'mwUploadsFunnel', 'nearby', { expires: new Date( new Date().getTime() + 60000) } );

					M.history.retrievePage( title, endpoint ).done( function( page ) {
						var preview = new PagePreviewOverlay( { page: new Page( page ) } );
						loader.hide();
						preview.show();
					} ).fail( function() {
						loader.hide(); // FIXME: do something more meaningful e.g. error overlay
					} );
				} );
			}
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

		new Nearby( {
			el: $content[0],
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
		} ).fail( function() {
			$( '#mw-mf-nearby' ).addClass( 'alert error content' ).text( mw.message( 'mobile-frontend-nearby-error' ) );
		} );
	}

	function init() {
		var $content = $( '#mw-mf-nearby' ).empty();
		$( '<div class="content loading"> ').text(
			mw.message( 'mobile-frontend-nearby-loading' ) ).appendTo( $content );
		navigator.geolocation.watchPosition( function( geo ) {
			var lat = geo.coords.latitude, lng = geo.coords.longitude;
			if ( curLocation && lat.toFixed( PRECISION ) === curLocation.latitude.toFixed( PRECISION ) &&
				lng.toFixed( PRECISION ) === curLocation.longitude.toFixed( PRECISION ) ) { // bug 47898
				return;
			} else {
				curLocation = geo.coords;
				cache( CACHE_KEY_LAST_LOCATION, $.toJSON( curLocation ) );
				findResults( lat, lng );
			}
		},
		function() {
			popup.show( mw.message( 'mobile-frontend-nearby-lookup-error' ).plain(), 'toast' );
		},
		{
			enableHighAccuracy: true
		} );
	}

	if ( supported ) {
		if ( lastKnownLocation ) {
			curLocation = $.parseJSON( lastKnownLocation );
		}
		init();
		if ( lastSearchResult ) {
			render( $( '#content' ), $.parseJSON( lastSearchResult ) );
		}
	}
	M.define( 'nearby', {
		distanceMessage: distanceMessage
	} );
}() );


}( mw.mobileFrontend, jQuery ) );
