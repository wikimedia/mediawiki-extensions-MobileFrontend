( function( M, $ ) {
	var latLng, lat, lng,
		Overlay = M.require( 'Overlay' ),
		overlay,
		Nearby = M.require( 'modules/nearby/Nearby' ),
		NearbyOverlay;

	NearbyOverlay = Overlay.extend( {
			active: false,
			className: 'mw-mf-overlay list-overlay',
			template: M.template.get( 'overlays/nearby' ),
			defaults: {
				heading: 'Nearby',
				pretext: mw.message( 'mobile-frontend-nearby-to-page', mw.config.get( 'wgTitle' ) )
			},
			initialize: function( options ) {
				this._super( options );
				this.latLngString = options.latitude + ',' + options.longitude;
			},
			postRender: function( options ) {
				var widget;

				this._super( options );
				widget = new Nearby( {
					range: 2000,
					location: { longitude: options.longitude, latitude: options.latitude },
					el: this.$( '.container' )
				} );
			}
	} );


	function initNearbyButton( latitude, longitude ) {
		$( '<button class="nearby">' ).on( 'click', function() {
			if ( !overlay ) {
				overlay = new NearbyOverlay( { latitude: latitude, longitude: longitude } );
			}
			overlay.show();
		} ).appendTo( '#section_0' );
	}

	function init() {
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
			initNearbyButton( lat, lng );
		}
	}
	init();
	M.on( 'page-loaded', init );

}( mw.mobileFrontend, jQuery ) );
