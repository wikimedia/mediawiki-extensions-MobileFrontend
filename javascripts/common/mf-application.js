// FIXME: make this an object with a constructor to facilitate testing
// (see https://bugzilla.wikimedia.org/show_bug.cgi?id=44264)
( function( M, $ ) {
	var EventEmitter = M.require( 'eventemitter' ),
		// FIXME: when mobileFrontend is an object with a constructor,
		// just inherit from EventEmitter instead
		eventEmitter = new EventEmitter(),
		template,
		templates = {},
		scrollY;

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

	/**
	 * @deprecated
	 */
	function message( name, arg1 ) {
		return mw.msg( name, arg1 );
	}

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

	// http://stackoverflow.com/a/12621264/365238
	function supports3dTransforms() {
		var el = document.createElement( 'p' ), has3d, t,
			transforms = {
				'webkitTransform': '-webkit-transform',
				//'OTransform': '-o-transform',
				//'msTransform': '-ms-transform',
				'transform': 'transform'
			};

		// Add it to the body to get the computed style
		document.body.insertBefore(el, null);

		for ( t in transforms ) {
			if ( el.style[t] !== undefined ) {
				el.style[t] = 'translate3d(1px,1px,1px)';
				has3d = window.getComputedStyle( el ).getPropertyValue( transforms[t] );
			}
		}

		document.body.removeChild(el);

		return ( has3d !== undefined && has3d.length > 0 && has3d !== "none" );
	}

	// Try to scroll and hide URL bar
	scrollY = window.scrollY || 0;
	if( !window.location.hash && scrollY < 10 ) {
		window.scrollTo( 0, 1 );
	}

	function triggerPageReadyHook( pageTitle, sectionData, anchorSection ) {
		emit( 'page-loaded', {
			title: pageTitle, data: sectionData, anchorSection: anchorSection
		} );
	}

	// TODO: separate main menu navigation code into separate module
	function init() {
		// FIXME: use wgIsMainPage
		var mainPage = document.getElementById( 'mainpage' ),
			$doc = $( 'html' );

		if ( mainPage ) {
			emit( 'homepage-loaded' );
		}

		$doc.removeClass( 'page-loading' );
		if( supportsPositionFixed() ) {
			$doc.addClass( 'supportsPositionFixed' );
		}
		if ( supports3dTransforms() ) {
			$doc.addClass( 'transforms' );
		}

		// when rotating to landscape stop page zooming on ios
		// allow disabling of transitions in android ics 4.0.2
		function fixBrowserBugs() {
			// see http://adactio.com/journal/4470/
			var viewportmeta = document.querySelector && document.querySelector( 'meta[name="viewport"]' ),
				ua = navigator.userAgent,
				android = ua.match( /Android/ );
			if( viewportmeta && ua.match( /iPhone|iPad/i )  ) {
				viewportmeta.content = 'minimum-scale=1.0, maximum-scale=1.0';
				document.addEventListener( 'gesturestart', function() {
					viewportmeta.content = 'minimum-scale=0.25, maximum-scale=1.6';
				}, false );
			} else if( ua.match(/Android 4\.0\.2/) ){
				$doc.addClass( 'android4-0-2' );
			}
			if ( android ) {
				$doc.addClass( 'android' );
			}
		}
		fixBrowserBugs();
	}

	// FIXME: remove when we use api module everywhere
	/**
	 * @deprecated
	 */
	function getApiUrl() {
		return mw.config.get( 'wgScriptPath', '' ) + '/api.php';
	}

	// FIXME: Kill the need for this horrible function by giving me a nicer API
	function getPageArrayFromApiResponse( response ) {
		var key, results = [], pages = response.query.pages;

		for ( key in pages ) {
			if ( pages.hasOwnProperty( key ) ) {
				results.push( pages[ key ] );
			}
		}
		return results;
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
		getPageArrayFromApiResponse: getPageArrayFromApiResponse,
		getSessionId: getSessionId,
		isLoggedIn: isLoggedIn,
		log: log,
		message: message,
		on: on,
		prefix: 'mw-mf-',
		supportsPositionFixed: supportsPositionFixed,
		triggerPageReadyHook: triggerPageReadyHook,
		prettyEncodeTitle: prettyEncodeTitle,
		utils: $, // FIXME: deprecate
		template: template
	} );

}( mw.mobileFrontend, jQuery ) );
