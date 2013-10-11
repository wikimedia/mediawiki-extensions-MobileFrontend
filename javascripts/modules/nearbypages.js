( function( M, $ ) {
	var latLng, lat, lng,
		MobileWebClickTracking = M.require( 'loggingSchemas/MobileWebClickTracking' ),
		overlay;

	function initNearbyButton( title, latitude, longitude ) {
		function loadGeoNotAHack() {
			mw.loader.using( 'mobile.nearby.beta', function() {
				var NearbyOverlay = M.require( 'modules/nearby/NearbyOverlay' );
				if ( !overlay ) {
					MobileWebClickTracking.log( 'geonotahack-clicked' );
					overlay = new NearbyOverlay( { title: title, latitude: latitude, longitude: longitude, source: 'geonotahack' } );
				}
				overlay.show();
			} );
		}

		var $btn;
		if ( M.router.isSupported() ) {
			$btn = $( '<a class="button nearby">' ).attr( 'href', '#geonotahack' );
			M.router.route( /^geonotahack$/, loadGeoNotAHack );
		} else {
			$btn = $( '<button class="nearby">' ).on( 'click', loadGeoNotAHack );
		}
		$btn.text( mw.msg( 'mobile-frontend-geonotahack' ) ).appendTo( '#page-secondary-actions' );
	}

	function init( page ) {
		// reset the overlay in case a new page was loaded
		overlay = null;
		// in form 37.783; -122.417 - take the first one
		latLng = $( '.geo' ).eq( 0 ).text();
		// Matches <number>;<spaces><number> where number can be negative or positive and a float or integer
		latLng = latLng.match( /([\-]?[\-0-9]+[\.]?[0-9]*);[ ]+([\-]?[0-9]+[\.]?[0-9]*)/ );
		if ( latLng ) {
			lat = latLng[1];
			lng = latLng[2];
		}

		if ( lat && lng ) {
			// in business!
			initNearbyButton( page ? page.title : mw.config.get( 'wgTitle' ), lat, lng );
		}
	}
	init();
	M.on( 'page-loaded', init );

}( mw.mobileFrontend, jQuery ) );
