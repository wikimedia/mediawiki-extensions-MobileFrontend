( function( M, $ ) {
	var latLng, lat, lng,
		NearbyOverlay = M.require( 'modules/nearby/NearbyOverlay' ),
		overlay;


	function initNearbyButton( title, latitude, longitude ) {
		$( '<button class="nearby">' ).on( 'click', function() {
			if ( !overlay ) {
				overlay = new NearbyOverlay( { title: title, latitude: latitude, longitude: longitude } );
			}
			overlay.show();
		} ).appendTo( '#section_0' );
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
