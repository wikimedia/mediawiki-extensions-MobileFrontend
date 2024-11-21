const util = require( './util' );

let browser;

/**
 * Memoize a class method. Caches the result of the method based on the
 * arguments. Instances do not share a cache.
 *
 * @private
 * @param {Function} method Method to be memoized
 * @return {Function}
 */
function memoize( method ) {
	/**
	 * Memoized version of the method
	 *
	 * @return {Function}
	 */
	const memoized = function () {
		const cache = this[ '__cache' + memoized.cacheId ] ||
			( this[ '__cache' + memoized.cacheId ] = {} ),
			key = [].join.call( arguments, '|' );
		if ( Object.prototype.hasOwnProperty.call( cache, key ) ) {
			return cache[ key ];
		}
		return ( cache[ key ] = method.apply( this, arguments ) );
	};
	memoized.cacheId = Date.now().toString() + Math.random().toString();
	return memoized;
}

/**
 * Representation of user's current browser
 *
 * @class Browser
 * @private
 */
class Browser {
	/**
	 * @param {string} userAgent the user agent of the current browser
	 * @param {jQuery.Object} $container an element to associate with the Browser object
	 */
	constructor( userAgent, $container ) {
		this.userAgent = userAgent;
		this.$el = $container;
		/**
		 * Returns whether the current browser is an ios device.
		 * FIXME: jquery.client does not support iPad detection so we cannot use it.
		 *
		 * @instance
		 * @param {number} [version] integer describing a specific version you want to test against.
		 * @return {boolean}
		 */
		this.isIos = memoize( function ( version ) {
			const ua = this.userAgent,
				ios = /ipad|iphone|ipod/i.test( ua );

			if ( ios && version ) {
				switch ( version ) {
					case 8:
					// Test UA for iOS8. Or for simulator look for Version 8
					// In the iOS simulator the OS is the host machine OS version
					// This makes testing in iOS8 simulator work as expected
						return /OS 8_/.test( ua ) || /Version\/8/.test( ua );
					case 4:
						return /OS 4_/.test( ua );
					case 5:
						return /OS 5_/.test( ua );
					default:
						return false;
				}
			} else {
				return ios;
			}
		} );
		/**
		 * Determine if a device has a widescreen.
		 *
		 * @instance
		 * @return {boolean}
		 */
		this.isWideScreen = memoize( () => {
			const val = parseInt( mw.config.get( 'wgMFDeviceWidthTablet' ), 10 );
			// Check viewport width to determine mobile vs tablet.
			// Note: Mobile devices held in landscape mode might receive tablet treatment.
			return window.innerWidth >= val;
		} );
		/**
		 * Whether touchstart and other touch events are supported by the current browser.
		 *
		 * @instance
		 * @return {boolean}
		 */
		this.supportsTouchEvents = memoize( () => 'ontouchstart' in window );
	}

	/**
	 * @return {Browser}
	 */
	static getSingleton() {
		let $html;
		if ( !browser ) {
			$html = util.getDocument();
			browser = new Browser( window.navigator.userAgent, $html );
		}
		return browser;
	}
}

module.exports = Browser;
