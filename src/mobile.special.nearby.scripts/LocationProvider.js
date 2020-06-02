var LocationProvider,
	browser = require( '../mobile.startup/Browser' ).getSingleton(),
	util = require( '../mobile.startup/util' );

/**
 * API for retrieving location from user device
 *
 * @class LocationProvider
 */
LocationProvider = {
	/**
	 * Detect if browser supports geolocation
	 *
	 * @memberof LocationProvider
	 * @instance
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
	 * @memberof LocationProvider
	 * @instance
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
					var error;
					switch ( err.code ) {
						case err.PERMISSION_DENIED:
							error = 'permission';
							break;
						case err.TIMEOUT:
							error = 'timeout';
							break;
						case err.POSITION_UNAVAILABLE:
							error = 'location';
							break;
						default:
							error = 'unknown';
					}
					result.reject( error );
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

module.exports = LocationProvider;
