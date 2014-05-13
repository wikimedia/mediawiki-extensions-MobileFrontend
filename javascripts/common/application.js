// FIXME: make this an object with a constructor to facilitate testing
// (see https://bugzilla.wikimedia.org/show_bug.cgi?id=44264)
/**
 * @class mw.mobileFrontend
 * @singleton
 */
( function( M, $ ) {
	var Router = M.require( 'Router' ),
		OverlayManager = M.require( 'OverlayManager' ),
		qs = window.location.search.split( '?' )[1],
		PageApi = M.require( 'PageApi' ),
		pageApi = new PageApi(),
		Page = M.require( 'Page' ),
		router = new Router(),
		$viewportMeta, viewport,
		currentPage,
		inWideScreenMode = false,
		ua = window.navigator.userAgent,
		isAppleDevice = /ipad|iphone/i.test( ua ),
		isIPhone4 = isAppleDevice && /OS 4_/.test( ua ),
		isOldIPhone = isAppleDevice && /OS [4]_[0-2]|OS [3]_/.test( ua ),
		isIPhone5 = isAppleDevice && /OS 5_/.test( ua ),
		isAndroid2 = /Android 2/.test( ua );

	// See if local storage is supported
	try {
		localStorage.setItem( 'localStorageTest', 'localStorageTest' );
		localStorage.removeItem( 'localStorageTest' );
		M.supportsLocalStorage = true;
	} catch ( e ) {
		M.supportsLocalStorage = false;
	}

	// http://www.quirksmode.org/blog/archives/2010/12/the_fifth_posit.html
	// https://github.com/Modernizr/Modernizr/issues/167
	// http://mobilehtml5.org/
	/**
	 * @method
	 * @param {String} userAgent - an optional user agent to test against. Defaults to current browser user agent.
	 * @return {Boolean}
	 */
	function supportsPositionFixed( userAgent ) {
		var support = false;
		[
			// Webkit 534+
			/AppleWebKit\/(53[4-9]|5[4-9]\d?|[6-9])\d?\d?|AppleWebKit\/\d\d\d\d/,
			// Android 2+ (we lockViewport for Android 2 meaning we can support it)
			/Android [2-9]/,
			// any Firefox
			/Firefox/,
			// Trident (IE 10+)
			/Trident\/[6-9]|Trident\/1\d[\d\.]+/
		].forEach( function( item ) {
			if ( item.test( userAgent || navigator.userAgent ) ) {
				support = true;
			}
		} );
		return support;
	}

	/**
	 * @method
	 * @return {Boolean}
	 */
	function supportsGeoLocation() {
		return !!navigator.geolocation;
	}

	/**
	 * Whether touchstart and other touch events are supported by the current browser.
	 *
	 * @method
	 * @return {Boolean}
	 */
	function supportsTouchEvents() {
		return 'ontouchstart' in window;
	}

	/**
	 * Escape dots and colons in a hash, jQuery doesn't like them beause they
	 * look like CSS classes and pseudoclasses. See
	 * http://bugs.jquery.com/ticket/5241
	 * http://stackoverflow.com/questions/350292/how-do-i-get-jquery-to-select-elements-with-a-period-in-their-id
	 *
	 * @method
	 * @param {String} hash A hash to escape
	 * @return {String}
	 */
	function escapeHash( hash ) {
		return hash.replace( /(:|\.)/g, '\\$1' );
	}

	/**
	 * Locks the viewport so that pinch zooming is disabled
	 *
	 * @method
	 */
	function lockViewport() {
		$viewportMeta.attr( 'content', 'initial-scale=1.0, maximum-scale=1.0, user-scalable=no' );
	}

	/**
	 * Unlocks viewport so that pinch zooming is enabled
	 *
	 * @method
	 */
	function unlockViewport() {
		$viewportMeta.attr( 'content', viewport );
	}

	/**
	 * Tests current window size and if suitable loads styles and scripts specific for larger devices
	 * FIXME: Separate from application.js
	 *
	 * @method
	 */
	function loadWideScreenModules() {
		var modules = [ 'tablet.styles' ];
		if ( !inWideScreenMode && isWideScreen() &&
			$( 'body' ).hasClass( 'skin-minerva' ) && M.isBetaGroupMember() ) {
			// Adjust screen for tablets
			if ( inNamespace( '' ) ) {
				modules.push( 'tablet.scripts' );
			}
			inWideScreenMode = true;
			mw.loader.using( modules, function() {
				M.emit( 'resize' );
			} );
		}
	}

	// TODO: separate main menu navigation code into separate module
	/**
	 * @method
	 */
	function init() {
		var
			$body = $( 'body' ),
			$doc = $( 'html' ),
			$viewport = $( '#mw-mf-viewport' );

		$doc.removeClass( 'page-loading' ); // FIXME: Kill with fire. This is here for historic reasons in case old HTML is cached

		$( '<div id="notifications">' ).appendTo( $viewport );

		if ( !supportsPositionFixed() ) {
			$doc.addClass( 'no-position-fixed' );

			$( window ).on( 'scroll', function() {
				var scrollTop = $( window ).scrollTop(),
					windowHeight = $( window ).height(),
					activeElement = document.activeElement,
					scrollBottom = scrollTop + windowHeight;
				if ( isOldIPhone ) {
					if ( activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT' ) {
						// add the height of the open soft keyboard
						scrollBottom -= 120;
					} else {
						// add the height of the address bar
						scrollBottom += 60;
					}
				}

				if ( scrollTop === 0 ) {
					// special case when we're at the beginning of the page and many
					// browsers (e.g. Android 2.x) return wrong window height because
					// of the URL bar
					$viewport.add( '.overlay' ).height( '100%' );
				} else {
					// keep expanding the viewport until the end of the page reached
					// #notification has bottom: 0 and sticks to the end of the viewport
					$viewport.add( '.overlay' ).height( scrollBottom );
				}
			} );
		}

		$viewportMeta = $( 'meta[name="viewport"]' );
		viewport = $viewportMeta.attr( 'content' );
		// FIXME: If minimum-scale and maximum-scale are not set locking viewport will prevent a reset
		if ( viewport && viewport.indexOf( 'minimum-scale' ) === -1 ) {
			viewport += ', minimum-scale=0.25, maximum-scale=1.6';
		}

		// when rotating to landscape stop page zooming on ios
		// allow disabling of transitions in android ics 4.0.2
		function fixBrowserBugs() {
			// see http://adactio.com/journal/4470/ (fixed in ios 6)
			if( $viewportMeta[0] && ( isIPhone4 || isIPhone5 ) ) {
				lockViewport();
				document.addEventListener( 'gesturestart', function() {
					lockViewport();
				}, false );
			}

			// FIXME: Android 2.x can act weird
			// (remove if we drop support for some features on it)
			if ( isAndroid2 ) {
				$body.addClass( 'android2' );
				// lock the viewport for this device - too problematic
				lockViewport();
			}
		}
		fixBrowserBugs();

		/**
		 * Checks browser support for CSS transforms, transitions
		 * and CSS animation.
		 * Currently assumes support for the latter 2 in the case of the
		 * former.
		 * See http://stackoverflow.com/a/12621264/365238
		 *
		 * @returns {boolean}
		 */
		function supportsAnimations() {
			var el = $( '<p>' )[0], $iframe = $( '<iframe>' ), has3d, t,
			transforms = {
				'webkitTransform': '-webkit-transform',
				//'OTransform': '-o-transform',
				//'msTransform': '-ms-transform',
				'transform': 'transform'
			};

			// don't trust Android 2.x, really
			// animations cause textareas to misbehave on it
			// (http://stackoverflow.com/a/5734984/365238)
			if ( isAndroid2 ) {
				return false;
			}

			// Add it to the body to get the computed style
			// Sandbox it inside an iframe to avoid Android Browser quirks
			$iframe.appendTo( $body ).contents().find( 'body' ).append( el );

			for ( t in transforms ) {
				if ( el.style[t] !== undefined ) {
					el.style[t] = 'translate3d(1px,1px,1px)';
					has3d = window.getComputedStyle( el ).getPropertyValue( transforms[t] );
				}
			}

			$iframe.remove();

			return has3d !== undefined && has3d.length > 0 && has3d !== "none";
		}

		if ( mw.config.get( 'wgMFEnableCssAnimations' ) && supportsAnimations() ) {
			$doc.addClass( 'animations' );
		}

		if ( supportsTouchEvents() ) {
			$doc.addClass( 'touch-events' );
		}
		$( loadWideScreenModules );
		$( window ).on( 'resize', $.proxy( M, 'emit', 'resize' ) );
		M.on( 'resize', loadWideScreenModules );
		loadCurrentPage();
	}

	/**
	 * Returns the current URL including protocol
	 *
	 * @method
	 * @return {String}
	 */
	function getOrigin() {
		return window.location.protocol + '//' + window.location.hostname;
	}

	/**
	 * @method
	 * @return {String}
	 */
	function prettyEncodeTitle( title ) {
		return encodeURIComponent( title.replace( / /g, '_' ) ).replace( /%3A/g, ':' ).replace( /%2F/g, '/' );
	}

	/**
	 * FIXME: sandbox from mf-application.js
	 *
	 * @method
	 * @return {jQuery.Deferred}
	 */
	function log( schemaName, data ) {
		if ( mw.eventLog ) {
			return mw.eventLog.logEvent( schemaName, data );
		} else {
			return $.Deferred().reject( 'EventLogging not installed.' );
		}
	}

	/**
	 * Retrieve and, if not present, generate a random session ID
	 * (32 alphanumeric characters).
	 * FIXME: Use mw.user
	 * FIXME: Fall back to using cookies if localStorage isn't supported
	 *
	 * @method
	 * @return {string}
	 */
	function getSessionId() {
		var sessionId;
		if ( !M.supportsLocalStorage ) {
			return null;
		}
		sessionId = localStorage.getItem( 'sessionId' );

		if ( !sessionId ) {
			// FIXME: use mw.user.generateRandomSessionId when we can,
			// as of now mediawiki.user has no mobile target (yay, targets in RL!)
			sessionId = '';
			while ( sessionId.length < 32 ) {
				// http://stackoverflow.com/a/8084248/365238
				sessionId += Math.random().toString(36).slice(2, 32 + 2 - sessionId.length);
			}
			localStorage.setItem( 'sessionId', sessionId );
		}
		return sessionId;
	}

	/**
	 * Takes a Query string and turns it into a JavaScript object mapping parameter names
	 * to values. Does the opposite of $.param
	 *
	 * @method
	 * @param {String} qs A querystring excluding the ? prefix. e.g. foo=4&bar=5
	 * @return {Object}
	 */
	function deParam( qs ) {
		var params = {};
		if ( qs ) {
			qs.split( '&' ).forEach( function( p ) {
				p = p.split( '=' );
				params[ p[0] ] = p[1];
			} );
		}
		return params;
	}

	/**
	 *
	 * @method
	 * @return {Boolean}
	 */
	function isWideScreen() {
		var val = mw.config.get( 'wgMFDeviceWidthTablet' );
		// Check portrait and landscape mode to be consistent
		return window.innerWidth >= val || window.innerHeight >= val;
	}

	/**
	 * Sets the JavaScript configuration and HTML environment for a given page
	 * Emits a page-loaded event that modules can subscribe to, so that they can
	 * re-initialize
	 *
	 * @method
	 */
	function reloadPage( page ) {
		currentPage = page;
		var parts = page.title.split( ':' );

		// VisualEditor amongst other things relies on these variables to reflect current state of document
		// FIXME: Why are there so many of these!?
		// wgTitle does not have a namespace prefix. e.g. Talk:Foo -> Foo, Foo -> Foo
		mw.config.set( 'wgTitle', parts[1] || parts[0] );
		// wgPageName has namespace prefix
		mw.config.set( 'wgPageName', page.title.replace( / /g, '_' ) );
		mw.config.set( 'wgRelevantPageName', page.title );
		mw.config.set( 'wgArticleId', page.getId() );
		mw.config.set( 'wgRevisionId', page.getRevisionId() );
		M.emit( 'page-loaded', page );
		// Update page title with the displayTitle
		document.title = page.displayTitle;
	}

	/**
	 *
	 * @method
	 * @return {Boolean}
	 */
	function inNamespace( namespace ) {
		return mw.config.get( 'wgNamespaceNumber' ) === mw.config.get( 'wgNamespaceIds' )[namespace];
	}

	/**
	 *
	 * @method
	 * @return {Page}
	 */
	function getCurrentPage() {
		// FIXME: Currently returns undefined when a page has not been rendered via JavaScript
		return currentPage;
	}

	/**
	 * Return the first section of page content
	 *
	 * @method
	 * @return {Object}
	 */
	function getLeadSection() {
		return $( '#content > div' ).eq( 0 );
	}

	function loadCurrentPage() {
		var permissions = mw.config.get( 'wgRestrictionEdit', [] );
		if ( permissions.length === 0 ) {
			permissions.push( '*' );
		}
		currentPage = new Page( {
			title: mw.config.get( 'wgPageName' ).replace( /_/g, ' ' ),
			protection: {
				edit: permissions
			},
			lead: getLeadSection().html(),
			isMainPage: mw.config.get( 'wgIsMainPage' ),
			sections: pageApi.getSectionsFromHTML( $( '#content' ) ),
			id: mw.config.get( 'wgArticleId' )
		} );
	}

	$.extend( M, {
		init: init,
		escapeHash: escapeHash,
		inNamespace: inNamespace,
		getCurrentPage: getCurrentPage,
		getOrigin: getOrigin,
		getLeadSection: getLeadSection,
		getSessionId: getSessionId,
		isWideScreen: isWideScreen,
		lockViewport: lockViewport,
		log: log,
		reloadPage: reloadPage,
		supportsGeoLocation: supportsGeoLocation,
		supportsPositionFixed: supportsPositionFixed,
		prettyEncodeTitle: prettyEncodeTitle,
		query: deParam( qs ),
		// FIXME: Replace all instances of M.template with mw.template
		template: mw.template,
		unlockViewport: unlockViewport,
		/**
		 * @type {Router}
		 */
		router: router,
		/**
		 * @type {OverlayManager}
		 */
		overlayManager: new OverlayManager( router ),
		/**
		 * @type {PageApi}
		 */
		pageApi: pageApi,
		deParam: deParam,
		// for A/B testing (we want this to be the same everywhere)
		/**
		 * @type {Boolean}
		 */
		isTestA: mw.config.get( 'wgUserId' ) % 2 === 0,
		// FIXME: get rid off this (grep M.tapEvent) when micro.tap.js is in stable
		/**
		 * @method
		 * @param {String} fallbackEvent
		 * @return {String}
		 */
		tapEvent: function( fallbackEvent ) {
			return M.isBetaGroupMember() ? 'tap' : fallbackEvent;
		}
	} );

	// Initialize
	$( init );
}( mw.mobileFrontend, jQuery ) );
