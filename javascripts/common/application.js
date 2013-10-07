// FIXME: make this an object with a constructor to facilitate testing
// (see https://bugzilla.wikimedia.org/show_bug.cgi?id=44264)
( function( M, $ ) {
	var Router = M.require( 'Router' ),
		qs = window.location.search.split( '?' )[1],
		PageApi = M.require( 'PageApi' ),
		$viewportMeta, viewport,
		ua = window.navigator.userAgent,
		isAppleDevice = /ipad|iphone/i.test( ua ),
		isIPhone4 = isAppleDevice && /OS 4_/.test( ua ),
		isOldIPhone = isAppleDevice && /OS [4]_[0-2]|OS [3]_/.test( ua ),
		isIPhone5 = isAppleDevice && /OS 5_/.test( ua ),
		isAndroid2 = /Android 2/.test( ua );

	// http://www.quirksmode.org/blog/archives/2010/12/the_fifth_posit.html
	// https://github.com/Modernizr/Modernizr/issues/167
	// http://mobilehtml5.org/
	function supportsPositionFixed() {
		var support = false;
		[
			// Webkit 534+
			// FIXME: this will fail if Webkit goes past 599 and for Blink
			// (http://www.chromium.org/blink)
			/AppleWebKit\/(53[4-9]|5[4-9]\d?|[6-9])\d?\d?/,
			// Android 2+ (we lockViewport for Android 2 meaning we can support it)
			/Android [2-9]/,
			// any Firefox
			/Firefox/,
			// MSIE 10+
			/MSIE 1\d/
		].forEach( function( item ) {
			if ( item.test( navigator.userAgent ) ) {
				support = true;
			}
		} );
		return support;
	}

	function supportsGeoLocation() {
		return !!navigator.geolocation;
	}

	function lockViewport() {
		$viewportMeta.attr( 'content', 'initial-scale=1.0, maximum-scale=1.0, user-scalable=no' );
	}

	function unlockViewport() {
		$viewportMeta.attr( 'content', viewport );
	}

	// TODO: separate main menu navigation code into separate module
	function init() {
		var
			mode, $body = $( 'body' ),
			$doc = $( 'html' ),
			$viewport = $( '#mw-mf-viewport' );

		if ( $body.hasClass( 'alpha' ) ) {
			mode = 'alpha';
		} else {
			mode = $body.hasClass( 'beta' ) ? 'beta' : 'stable';
		}
		// FIXME: To remove. We currently set it here as well in case it is not in the raw HTML due to a caching problem
		mw.config.set( 'wgMFMode', mode );

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
					$viewport.add( '.mw-mf-overlay' ).height( '100%' );
				} else {
					// keep expanding the viewport until the end of the page reached
					// #notification has bottom: 0 and sticks to the end of the viewport
					$viewport.add( '.mw-mf-overlay' ).height( scrollBottom );
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
	}

	function isLoggedIn() {
		return mw.config.get( 'wgUserName' ) ? true : false;
	}

	function getOrigin() {
		return window.location.protocol + '//' + window.location.hostname;
	}

	function prettyEncodeTitle( title ) {
		return encodeURIComponent( title.replace( / /g, '_' ) ).replace( /%3A/g, ':' ).replace( /%2F/g, '/' );
	}

	// FIXME: sandbox from mf-application.js
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
	 *
	 * @return {string}
	 */
	function getSessionId() {
		var sessionId;
		if ( typeof localStorage === 'undefined' ) {
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

	function isWideScreen() {
		return window.innerWidth > mw.config.get( 'wgMFDeviceWidthTablet' );
	}

	/**
	 * Sets the JavaScript configuration and HTML environment for a given page
	 * Emits a page-loaded event that modules can subscribe to, so that they can
	 * re-initialize
	 *
	 */
	function reloadPage( page ) {
		if ( page.isMainPage() ) {
			$( 'body' ).addClass( 'page-Main_Page' );
		} else {
			$( 'body' ).removeClass( 'page-Main_Page' );
		}

		mw.config.set( 'wgArticleId', page.id );
		M.emit( 'page-loaded', page );
		// Update page title
		document.title = page.title;
	}

	$( init );

	$.extend( M, {
		init: init,
		jQuery: typeof jQuery  !== 'undefined' ? jQuery : false,
		getOrigin: getOrigin,
		// FIXME: No Page object exists on initial page load but would be better to make this a function of Page object
		getLeadSection: function() {
			return $( '#content div' ).eq( 0 );
		},
		getSessionId: getSessionId,
		isLoggedIn: isLoggedIn,
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
		router: new Router(),
		pageApi: new PageApi(),
		deParam: deParam,
		// for A/B testing (we want this to be the same everywhere)
		isTestA: mw.config.get( 'wgUserId' ) % 2 === 0,
		// FIXME: get rid off this (grep M.tapEvent) when micro.tap.js is in stable
		tapEvent: function( fallbackEvent ) {
			return mw.config.get( 'wgMFMode' ) === 'alpha' ? 'tap' : fallbackEvent;
		}
	} );

}( mw.mobileFrontend, jQuery ) );
