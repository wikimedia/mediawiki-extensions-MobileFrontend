( function ( M, $ ) {
	var browser;

	/**
	 * Memoize a class method. Caches the result of the method based on the
	 * arguments. Instances do not share a cache.
	 * @ignore
	 * @param {Function} method Method to be memoized
	 * @returns {Function}
	 */
	function memoize( method ) {
		/**
		 * Memoized version of the method
		 * @ignore
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
	 * @param {String} ua the user agent of the current browser
	 * @param {jQuery.Object} $container an element to associate with the Browser object
	 */
	function Browser( ua, $container ) {
		this.userAgent  = ua;
		this.$el = $container;
		if ( this.isAndroid2() ) {
			this.lockViewport();
		}
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
		 * @param {Number} [version] integer describing a specific version you want to test against.
		 * @return {Boolean}
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
		 * Determine if a device is Android 2.
		 * @method
		 * @return {Boolean}
		 */
		isAndroid2: memoize( function () {
			return /Android 2/.test( this.userAgent );
		} ),
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
		 * @returns {Boolean}
		 */
		supportsAnimations: memoize( function () {
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
				if ( transforms.hasOwnProperty( t ) ) {
					if ( el.style[t] !== undefined ) {
						el.style[t] = 'translate3d(1px,1px,1px)';
						has3d = window.getComputedStyle( el ).getPropertyValue( transforms[t] );
					}
				}
			}

			$iframe.remove();

			return has3d !== undefined && has3d.length > 0 && has3d !== 'none';
		} ),
		/**
		 * Detect if fixed position is supported in browser
		 * http://www.quirksmode.org/blog/archives/2010/12/the_fifth_posit.html
		 * https://github.com/Modernizr/Modernizr/issues/167
		 * http://mobilehtml5.org/
		 * @method
		 * @return {Boolean}
		 */
		supportsPositionFixed: memoize( function () {
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
		} ),
		/**
		 * Whether touchstart and other touch events are supported by the current browser.
		 *
		 * @method
		 * @return {Boolean}
		 */
		supportsTouchEvents: memoize( function () {
			return 'ontouchstart' in window;
		} ),
		/**
		 * Detect if browser supports geolocation
		 * @method
		 * @return {Boolean}
		 */
		supportsGeoLocation: memoize( function () {
			return 'geolocation' in navigator;
		} ),
		/**
		 * Detect if local storage
		 * @method
		 * @return {Boolean}
		 */
		supportsLocalStorage: memoize( function () {
			// See if local storage is supported
			try {
				localStorage.setItem( 'localStorageTest', 'localStorageTest' );
				localStorage.removeItem( 'localStorageTest' );
				return true;
			} catch ( e ) {
				return false;
			}
		} ),
		/**
		 * Detect if we support file input uploads
		 * @return {Boolean}
		 */
		supportsFileUploads: memoize( function () {
			var browserSupported;
			// If already calculated, just return it
			if ( this._fileUploads !== undefined ) {
				return this._fileUploads;
			}

			// deal with known false positives which don't support file input (bug 47374)
			if ( this.userAgent.match( /Windows Phone (OS 7|8.0)/ ) ) {
				this._fileUploads = false;
			} else {
				browserSupported = (
					typeof FileReader !== 'undefined' &&
					typeof FormData !== 'undefined' &&
					// Firefox OS 1.0 turns <input type="file"> into <input type="text">
					( $( '<input type="file"/>' ).prop( 'type' ) === 'file' )
				);
				this._fileUploads = browserSupported &&
					!mw.config.get( 'wgImagesDisabled', false );
			}
			return this._fileUploads;
		} )
	};

	browser = new Browser( window.navigator.userAgent, $( 'html' ) );
	M.define( 'Browser', Browser );
	M.define( 'browser', browser );
}( mw.mobileFrontend, jQuery ) );
