( function ( M ) {
	var browser,
		$html = M.require( 'mobile.startup/util' ).getDocument();

	/**
	 * Memoize a class method. Caches the result of the method based on the
	 * arguments. Instances do not share a cache.
	 * @ignore
	 * @param {Function} method Method to be memoized
	 * @return {Function}
	 */
	function memoize( method ) {
		/**
		 * Memoized version of the method
		 * @ignore
		 * @return {Function}
		 */
		var memoized = function () {
			var cache = this[ '__cache' + memoized.cacheId ] ||
				( this[ '__cache' + memoized.cacheId ] = {} ),
				key = [].join.call( arguments, '|' );
			if ( cache.hasOwnProperty( key ) ) {
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
		 */
		lockViewport: function () {
			if ( this.$el ) {
				this.$el.find( 'meta[name="viewport"]' )
					.attr( 'content', 'initial-scale=1.0, maximum-scale=1.0, user-scalable=no' );
			}
		},
		/**
		 * Determine if a device has a widescreen.
		 * @method
		 * @return {boolean}
		 */
		isWideScreen: memoize( function () {
			var val = parseInt( mw.config.get( 'wgMFDeviceWidthTablet' ), 10 );
			// Check portrait and landscape mode to be consistent
			return window.innerWidth >= val || window.innerHeight >= val;
		} ),
		/**
		 * Checks browser support for a given CSS property
		 * @param {string} [property] the name of the property being tested
		 * @return {boolean}
		 */
		supportsCSSProperty: memoize( function ( property ) {
			var elem = document.createElement( 'foo' );

			// We only test webkit because that's the only prefix needed at the moment by
			// supportsAnimations. If usage of supportsCSSProperty is expanded, the list of prefixes
			// will need to be as well
			return elem.style[ property ] !== undefined ||
				elem.style[ 'webkit' + property.charAt( 0 ).toUpperCase() + property.slice( 1 ) ] !== undefined;
		} ),
		/**
		 * Checks browser support for CSS transforms, transitions
		 * and CSS animation.
		 * Currently assumes support for the latter 2 in the case of the
		 * former.
		 * See http://stackoverflow.com/a/12621264/365238
		 *
		 * @return {boolean}
		 */
		supportsAnimations: memoize( function () {
			return this.supportsCSSProperty( 'animationName' ) &&
				this.supportsCSSProperty( 'transform' ) &&
				this.supportsCSSProperty( 'transition' );
		} ),
		/**
		 * Whether touchstart and other touch events are supported by the current browser.
		 *
		 * @method
		 * @return {boolean}
		 */
		supportsTouchEvents: memoize( function () {
			return 'ontouchstart' in window;
		} ),
		/**
		 * Detect if browser supports geolocation
		 * @method
		 * @return {boolean}
		 */
		supportsGeoLocation: memoize( function () {
			return 'geolocation' in navigator;
		} )
	};

	/**
	 * @static
	 * @return {Browser}
	 */
	Browser.getSingleton = function () {
		if ( !browser ) {
			browser = new Browser( window.navigator.userAgent, $html );
		}
		return browser;
	};

	M.define( 'mobile.startup/Browser', Browser )
		.deprecate( 'mobile.browser/Browser' );

}( mw.mobileFrontend ) );
