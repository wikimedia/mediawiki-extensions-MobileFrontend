( function( M ) {
	M.assertMode( [ 'beta', 'alpha', 'desktop-beta' ] );
	var Nearby = M.require( 'modules/nearby/Nearby' ),
		Overlay = M.require( 'OverlayNew' ),
		NearbyOverlay;

	/*
	* @class NearbyOverlay
	*/
	NearbyOverlay = Overlay.extend( {
			active: false,
			closeOnBack: true,
			templatePartials: {
				content: M.template.get( 'overlays/nearby' )
			},
			defaults: {
				heading: mw.message( 'mobile-frontend-nearby-title' )
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
					source: options.source,
					range: 2000,
					parentOverlay: this,
					exclude: options.title,
					location: { longitude: options.longitude, latitude: options.latitude },
					el: this.$( '.container' )
				} );
			}
	} );
	M.define( 'modules/nearby/NearbyOverlay', NearbyOverlay );

}( mw.mobileFrontend ) );
