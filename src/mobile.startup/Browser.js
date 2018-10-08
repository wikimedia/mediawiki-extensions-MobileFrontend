var
	util = require( './util' ),
	browser;

/**
 * Memoize a class method. Caches the result of the method based on the
 * arguments. Instances do not share a cache.
 * @param {Function} method Method to be memoized
 * @return {Function}
 */
function memoize( method ) {
	/**
	 * Memoized version of the method
	 * @return {Function}
	 */
	var memoized = function () {
		var cache = this[ '__cache' + memoized.cacheId ] ||
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
 * @class Browser
 * @param {string} ua the user agent of the current browser
 * @param {jQuery.Object} $container an element to associate with the Browser object
 */
function Browser( ua, $container ) {
	this.userAgent = ua;
	this.$el = $container;
	this._fixIosLandscapeBug();
}

Browser.prototype = {
	/**
	 * When rotating to landscape stop page zooming on ios 4 and 5.
	 * @memberof Browser
	 * @instance
	 * @private
	 */
	_fixIosLandscapeBug: function () {
		var self = this,
			viewport = this.$el.find( 'meta[name="viewport"]' )[0];

		// see http://adactio.com/journal/4470/ (fixed in ios 6)
		if ( viewport && ( this.isIos( 4 ) || this.isIos( 5 ) ) ) {
			this.lockViewport();
			document.addEventListener( 'gesturestart', function () {
				self.lockViewport();
			}, false );
		}
	},
	/**
	 * Returns whether the current browser is an ios device.
	 * FIXME: jquery.client does not support iPad detection so we cannot use it.
	 * @memberof Browser
	 * @instance
	 * @param {number} [version] integer describing a specific version you want to test against.
	 * @return {boolean}
	 */
	isIos: memoize( function ( version ) {
		var ua = this.userAgent,
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
	} ),
	/**
	 * Locks the viewport so that pinch zooming is disabled
	 * @memberof Browser
	 * @instance
	 */
	lockViewport: function () {
		if ( this.$el ) {
			this.$el.find( 'meta[name="viewport"]' )
				.attr( 'content', 'initial-scale=1.0, maximum-scale=1.0, user-scalable=no' );
		}
	},
	/**
	 * Determine if a device has a widescreen.
	 * @memberof Browser
	 * @instance
	 * @return {boolean}
	 */
	isWideScreen: memoize( function () {
		var val = parseInt( mw.config.get( 'wgMFDeviceWidthTablet' ), 10 );
		// Check portrait and landscape mode to be consistent
		return window.innerWidth >= val || window.innerHeight >= val;
	} ),
	/**
	 * Checks browser support for CSS transforms, transitions
	 * and CSS animation.
	 * Currently assumes support for the latter 2 in the case of the
	 * former.
	 * See http://stackoverflow.com/a/12621264/365238
	 * @memberof Browser
	 * @instance
	 * @return {boolean}
	 */
	supportsAnimations: memoize( function () {
		var elemStyle = document.createElement( 'foo' ).style;
		function supportsProperty( property ) {
			// We only test "webkit-", because that's the only prefix needed for the relevant
			// properties (in supportsAnimations) and supported browsers. If usage is expanded,
			// other prefixes may need to be checked as well.
			return property in elemStyle ||
				( 'webkit' + property[ 0 ].toUpperCase() + property.slice( 1 ) ) in elemStyle;
		}
		return supportsProperty( 'animationName' ) &&
			supportsProperty( 'transform' ) &&
			supportsProperty( 'transition' );
	} ),
	/**
	 * Whether touchstart and other touch events are supported by the current browser.
	 * @memberof Browser
	 * @instance
	 * @return {boolean}
	 */
	supportsTouchEvents: memoize( function () {
		return 'ontouchstart' in window;
	} ),
	/**
	 * Detect if browser supports geolocation
	 * @memberof Browser
	 * @instance
	 * @return {boolean}
	 */
	supportsGeoLocation: memoize( function () {
		return 'geolocation' in window.navigator;
	} )
};

/**
 * @memberof Browser
 * @return {Browser}
 */
Browser.getSingleton = function () {
	var $html;
	if ( !browser ) {
		$html = util.getDocument();
		browser = new Browser( window.navigator.userAgent, $html );
	}
	return browser;
};

module.exports = Browser;
