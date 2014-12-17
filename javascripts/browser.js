( function ( M, $ ) {
	var browser;

	/**
	 * Representation of user's current browser
	 * @class Browser
	 * @param {String} ua the user agent of the current browser
	 */
	function Browser( ua ) {
		this.userAgent  = ua;
	}

	Browser.prototype = {
		/**
		 * Determine if a device is Android 2.
		 * @method
		 * @return {Boolean}
		 */
		isAndroid2: function () {
			return /Android 2/.test( this.userAgent );
		},
		/**
		 * Determine if a device has a widescreen.
		 * @method
		 * @return {Boolean}
		 */
		isWideScreen: function () {
			var val = mw.config.get( 'wgMFDeviceWidthTablet' );
			// Check portrait and landscape mode to be consistent
			return window.innerWidth >= val || window.innerHeight >= val;
		},
		/**
		 * Checks browser support for CSS transforms, transitions
		 * and CSS animation.
		 * Currently assumes support for the latter 2 in the case of the
		 * former.
		 * See http://stackoverflow.com/a/12621264/365238
		 *
		 * @returns {boolean}
		 */
		supportsAnimations: function () {
			var  has3d, t,
				el = $( '<p>' )[0],
				$iframe = $( '<iframe>' ),
				transforms = {
					webkitTransform: '-webkit-transform',
					transform: 'transform'
				};

			// don't trust Android 2.x, really
			// animations cause textareas to misbehave on it
			// (http://stackoverflow.com/a/5734984/365238)
			if ( this.isAndroid2() ) {
				return false;
			}

			// Add it to the body to get the computed style
			// Sandbox it inside an iframe to avoid Android Browser quirks
			$iframe.appendTo( 'body' ).contents().find( 'body' ).append( el );

			for ( t in transforms ) {
				if ( el.style[t] !== undefined ) {
					el.style[t] = 'translate3d(1px,1px,1px)';
					has3d = window.getComputedStyle( el ).getPropertyValue( transforms[t] );
				}
			}

			$iframe.remove();

			return has3d !== undefined && has3d.length > 0 && has3d !== 'none';
		},
		/**
		 * Detect if fixed position is supported in browser
		 * http://www.quirksmode.org/blog/archives/2010/12/the_fifth_posit.html
		 * https://github.com/Modernizr/Modernizr/issues/167
		 * http://mobilehtml5.org/
		 * @method
		 * @return {Boolean}
		 */
		supportsPositionFixed: function () {
			var support = false,
				userAgent = this.userAgent;

			$.each( [
				// Webkit 534+
				/AppleWebKit\/(53[4-9]|5[4-9]\d|[6-9]\d\d|\d{4,})/,
				// Android 2+ (we lockViewport for Android 2 meaning we can support it)
				/Android [2-9]/,
				// any Firefox
				/Firefox/,
				// Trident (IE 10+)
				/Trident\/[6-9]|Trident\/1\d[\d\.]+/
			], function ( index, item ) {
				if ( item.test( userAgent ) ) {
					support = true;
				}
			} );
			return support;
		},
		/**
		 * Whether touchstart and other touch events are supported by the current browser.
		 *
		 * @method
		 * @return {Boolean}
		 */
		supportsTouchEvents: function () {
			return 'ontouchstart' in window;
		},
		/**
		 * Detect if browser supports geolocation
		 * @method
		 * @return {Boolean}
		 */
		supportsGeoLocation: function () {
			return !!navigator.geolocation;
		},
		/**
		 * Detect if local storage
		 * @method
		 * @return {Boolean}
		 */
		supportsLocalStorage: function () {
			// See if local storage is supported
			try {
				localStorage.setItem( 'localStorageTest', 'localStorageTest' );
				localStorage.removeItem( 'localStorageTest' );
				return true;
			} catch ( e ) {
				return false;
			}
		}
	};

	browser = new Browser( window.navigator.userAgent );
	M.define( 'Browser', Browser );
	M.define( 'browser', browser );
}( mw.mobileFrontend, jQuery ) );
