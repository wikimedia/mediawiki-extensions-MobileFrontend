( function( M, $ ) {
	var latLng, lat, lng,
		Overlay = M.require( 'Overlay' ),
		overlay,
		Nearby = M.require( 'modules/nearby/Nearby' ),
		NearbyOverlay;

	// FIXME: Move to nearby/NearbyOverlay.js
	NearbyOverlay = Overlay.extend( {
			active: false,
			className: 'mw-mf-overlay list-overlay',
			template: M.template.get( 'overlays/nearby' ),
			defaults: {
				heading: 'Nearby'
			},
			initialize: function( options ) {
				options.pretext = mw.message( 'mobile-frontend-nearby-to-page', options.title );
				this._super( options );
				this.latLngString = options.latitude + ',' + options.longitude;
			},
			postRender: function( options ) {
				var widget;

				this._super( options );
				widget = new Nearby( {
					range: 2000,
					parentOverlay: this,
					location: { longitude: options.longitude, latitude: options.latitude },
					el: this.$( '.container' )
				} );
			}
	} );


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
