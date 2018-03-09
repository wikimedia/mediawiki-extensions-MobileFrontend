( function ( M ) {
	var LocationProvider,
		browser = M.require( 'mobile.startup/Browser' ).getSingleton(),
		util = M.require( 'mobile.startup/util' );

	/**
	 * API for retrieving location from user device
	 * @class LocationProvider
	 */
	LocationProvider = {
		/**
		 * Detect if browser supports geolocation
		 * @method
		 * @return {boolean}
		 */
		isAvailable: function () {
			return browser.supportsGeoLocation();
		},

		/**
		 * Obtain users current location and return a deferred object with the
		 * longitude and latitude values
		 * Resolve return object with 'incompatible' if browser doesn't support geo location
		 *
		 * @return {jQuery.Deferred}
		 */
		getCurrentPosition: function () {
			var result = util.Deferred();
			if ( LocationProvider.isAvailable() ) {
				navigator.geolocation.getCurrentPosition(
					function ( geo ) {
						result.resolve( {
							latitude: geo.coords.latitude,
							longitude: geo.coords.longitude
						} );
					},
					function ( err ) {
						// see https://developer.mozilla.org/en-US/docs/Web/API/PositionError
						if ( err.code === 1 ) {
							err = 'permission';
						} else {
							err = 'locating';
						}
						result.reject( err );
					},
					{
						timeout: 10000,
						enableHighAccuracy: true
					}
				);
			} else {
				result.reject( 'incompatible' );
			}
			return result;
		}
	};

	M.define( 'mobile.nearby/LocationProvider', LocationProvider );
}( mw.mobileFrontend ) );
