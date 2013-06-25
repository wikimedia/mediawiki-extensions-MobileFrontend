// FIXME: make this an object with a constructor to facilitate testing
// (see https://bugzilla.wikimedia.org/show_bug.cgi?id=44264)
( function( M, $ ) {
	var EventEmitter = M.require( 'eventemitter' ),
		Router = M.require( 'Router' ),
		// FIXME: when mobileFrontend is an object with a constructor,
		// just inherit from EventEmitter instead
		eventEmitter = new EventEmitter(),
		$viewport, viewport,
		template,
		templates = {};

	/**
	 * See EventEmitter#on.
	 */
	function on(/* event, callback */ ) {
		return eventEmitter.on.apply( eventEmitter, arguments );
	}

	/**
	 * See EventEmitter#emit.
	 */
	function emit(/* event, arg1, arg2, ... */ ) {
		return eventEmitter.emit.apply( eventEmitter, arguments );
	}

	template = {
		/**
		 * Define template using html. Compiles newly added templates
		 *
		 * @param {string} name: Name of template to add
		 * @param {string} markup: Associated markup (html)
		 */
		add: function( name, markup ) {
			templates[ name ] = this.compile( markup );
		},
		/**
		 * Retrieve defined template
		 *
		 * @param {string} name: Name of template to be retrieved
		 * @return {Hogan.Template}
		 * accepts template data object as its argument.
		 */
		get: function( name ) {
			if ( !templates[ name ] ) {
				throw new Error( 'Template not found: ' + name );
			}
			return templates[ name ];
		},
		/**
		 * Wraps our template engine of choice (currently Hogan).
		 *
		 * @param {string} templateBody Template body.
		 * @return {Hogan.Template}
		 * accepts template data object as its argument.
		 */
		compile: function( templateBody ) {
			return Hogan.compile( templateBody );
		}
	};

	// TODO: only apply to places that need it
	// http://www.quirksmode.org/blog/archives/2010/12/the_fifth_posit.html
	// https://github.com/Modernizr/Modernizr/issues/167
	function supportsPositionFixed() {
		// TODO: don't use device detection
		var agent = navigator.userAgent,
			support = false,
			supportedAgents = [
			// match anything over Webkit 534
			/AppleWebKit\/(53[4-9]|5[4-9]\d?|[6-9])\d?\d?/,
			// Android 3+
			/Android [3-9]/
		];
		supportedAgents.forEach( function( item ) {
			if( agent.match( item ) ) {
				support = true;
			}
		} );
		return support;
	}

	function supportsGeoLocation() {
		return !!navigator.geolocation;
	}

	function lockViewport() {
		$viewport.attr( 'content', 'minimum-scale=1.0, maximum-scale=1.0' );
	}

	function unlockViewport() {
		$viewport.attr( 'content', viewport );
	}

	// TODO: separate main menu navigation code into separate module
	function init() {
		var
			mode, $body = $( 'body' ),
			$doc = $( 'html' );

		if ( $body.hasClass( 'alpha' ) ) {
			mode = 'alpha';
		} else {
			mode = $body.hasClass( 'beta' ) ? 'beta' : 'stable';
		}
		mw.config.set( 'wgMFMode', mode );

		$doc.removeClass( 'page-loading' ); // FIXME: Kill with fire. This is here for historic reasons in case old HTML is cached
		if( supportsPositionFixed() ) {
			$doc.addClass( 'supportsPositionFixed' );
		}

		$viewport = $( 'meta[name="viewport"]' );
		viewport = $viewport.attr( 'content' );
		// FIXME: If minimum-scale and maximum-scale are not set locking viewport will prevent a reset
		if ( viewport && viewport.indexOf( 'minimum-scale' ) === -1 ) {
			viewport += ', minimum-scale=0.25, maximum-scale=1.6';
		}

		// when rotating to landscape stop page zooming on ios
		// allow disabling of transitions in android ics 4.0.2
		function fixBrowserBugs() {
			// see http://adactio.com/journal/4470/ (fixed in ios 6)
			var
				ua = navigator.userAgent;
			if( $viewport[0] && ua.match( /iPhone|iPad/i ) && ua.match( /OS [4-5]_0/ )  ) {
				lockViewport();
				document.addEventListener( 'gesturestart', function() {
					lockViewport();
				}, false );
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

			return has3d !== undefined && has3d.length > 0 && has3d !== "none";
		}

		if ( mw.config.get( 'wgMFEnableCssAnimations' ) && supportsAnimations() ) {
			$( 'html' ).addClass( 'animations' );
		}
	}

	// FIXME: remove when we use api module everywhere
	/**
	 * @deprecated
	 */
	function getApiUrl() {
		return mw.config.get( 'wgScriptPath', '' ) + '/api.php';
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
			mw.eventLog.logEvent( schemaName, data );
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

	$( init );

	$.extend( M, {
		init: init,
		emit: emit,
		jQuery: typeof jQuery  !== 'undefined' ? jQuery : false,
		getApiUrl: getApiUrl,
		getOrigin: getOrigin,
		getSessionId: getSessionId,
		isLoggedIn: isLoggedIn,
		lockViewport: lockViewport,
		log: log,
		on: on,
		prefix: 'mw-mf-',
		supportsGeoLocation: supportsGeoLocation,
		supportsPositionFixed: supportsPositionFixed,
		prettyEncodeTitle: prettyEncodeTitle,
		template: template,
		unlockViewport: unlockViewport,
		router: new Router()
	} );

}( mw.mobileFrontend, jQuery ) );
