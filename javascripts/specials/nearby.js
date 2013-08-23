// FIXME: Refactor to use modules/nearby/Nearby
( function( M, $ ) {
var CACHE_KEY_RESULTS = 'mfNearbyLastSearchResult',
	overlay,
	Nearby = M.require( 'modules/nearby/Nearby' ),
	NearbyApi = M.require( 'modules/nearby/NearbyApi' ),
	api = new NearbyApi(),
	CACHE_KEY_LAST_LOCATION = 'mfNearbyLastKnownLocation';

$( function() {
	var supported = M.supportsGeoLocation(),
		$userBtn = $( '#user-button' ),
		curLocation,
		lastKnownLocation = M.settings.getUserSetting( CACHE_KEY_LAST_LOCATION ),
		cache = M.settings.saveUserSetting,
		lastSearchResult = M.settings.getUserSetting( CACHE_KEY_RESULTS ),
		// FIXME: Adapt modules/nearby/Nearby.js and use that instead
		pendingQuery = false, btn;

		overlay = new Nearby( {
			el: $( '#mw-mf-nearby' )
		} );

	function render( $content, pages ) {
		cache( CACHE_KEY_RESULTS, $.toJSON( pages ) ); // cache result

		overlay.render( {
			pages: pages
		} );
	}

	function findResults( location ) {
		var $content = $( '#mw-mf-nearby' ), range = mw.config.get( 'wgMFNearbyRange' );

		api.getPages( location, range ).done( function( pages ) {
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
		// FIXME: Move searching for geolocation into Nearby module
		overlay.render( { showLoader: true } );
		navigator.geolocation.getCurrentPosition( function( geo ) {
			var lat = geo.coords.latitude, lng = geo.coords.longitude;
			curLocation = { latitude: lat, longitude: lng }; // save as json so it can be cached bug 48268
			cache( CACHE_KEY_LAST_LOCATION, $.toJSON( curLocation ) );
			findResults( curLocation );
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
		$userBtn.remove();
	}
	// FIXME: i18n
	btn = $( '<button class="refresh">' ).on( 'click', refresh ).appendTo( '.header' );
} );

}( mw.mobileFrontend, jQuery ) );
