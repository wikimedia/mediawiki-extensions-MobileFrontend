( function( M, $ ) {
	var latLng, lat, lng,
		MobileWebClickTracking = M.require( 'loggingSchemas/MobileWebClickTracking' ),
		LoadingOverlay = M.require( 'LoadingOverlay' ),
		loader = new LoadingOverlay(),
		overlay;

	function initNearbyButton( title, latitude, longitude ) {
		function loadGeoNotAHack() {
			loader.show();
			mw.loader.using( 'mobile.special.nearby.beta', function() {
				var NearbyOverlay = M.require( 'modules/nearby/NearbyOverlay' );
				if ( !overlay ) {
					MobileWebClickTracking.log( 'geonotahack-clicked' );
					overlay = new NearbyOverlay( { title: title, latitude: latitude, longitude: longitude, source: 'geonotahack' } );
				}
				loader.hide();
				overlay.show();
			} );
		}

		var $btn;
		if ( M.router.isSupported() ) {
			$btn = $( '<a class="mw-ui-button mw-ui-progressive button nearby icon icon-32px">' ).attr( 'href', '#geonotahack' );
			M.router.route( /^geonotahack$/, loadGeoNotAHack );
		} else {
			$btn = $( '<button class="mw-ui-button mw-ui-progressive nearby icon icon-32px">' ).on( 'click', loadGeoNotAHack );
		}
		$btn.text( mw.msg( 'mobile-frontend-geonotahack' ) ).appendTo( '#page-secondary-actions' );
	}

	function init( page ) {
		// reset the overlay in case a new page was loaded
		overlay = null;
		latLng = mw.config.get( 'wgCoordinates' );
		if ( latLng ) {
			lat = latLng.lat;
			lng = latLng.lon;
		} else {
			// TODO: kill this b/c code when https://gerrit.wikimedia.org/r/104679
			// gets deployed everywhere and old Varnish cache expires

			// in form 37.783; -122.417 - take the first one
			latLng = $( '.geo' ).eq( 0 ).text();
			// Matches <Number>;<optional space(s)}><Number> where Number can be negative or positive and a float or Number
			latLng = latLng.match( /([\-]?[\-0-9]+[\.]?[0-9]*);[ ]*([\-]?[0-9]+[\.]?[0-9]*)/ );
			if ( latLng ) {
				lat = latLng[1];
				lng = latLng[2];
			}
		}

		if ( lat && lng ) {
			// in business!
			initNearbyButton( page ? page.title : mw.config.get( 'wgTitle' ), lat, lng );
		}
	}
	init();
	M.on( 'page-loaded', init );

}( mw.mobileFrontend, jQuery ) );
