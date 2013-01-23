/* some polyfill */
if( typeof Array.prototype.forEach === 'undefined' ) {
	Array.prototype.forEach = function( callback ) {
		var i;
		for( i = 0; i < this.length; i++ ) {
			callback( this[ i ], i );
		}
	};
}

// FIXME: make this an object with a constructor to facilitate testing
// (see https://bugzilla.wikimedia.org/show_bug.cgi?id=44264)
mw.mobileFrontend = (function() {
	var u, modules = [],
		scrollY,
		moduleNamespace = {},
		_modules = {}, // FIXME: remove _ when registerModule() and getModule() are gone
		$ = typeof jQuery === 'undefined' ? false : jQuery,
		doc = document.documentElement;

	/**
	 * Require (import) a module previously defined using define().
	 *
	 * @param {string} id Required module id.
	 * @return {Object} Required module, can be any JavaScript object.
	 */
	function require( id ) {
		if ( !_modules[ id ] ) {
			throw new Error( 'Module not found: ' + id );
		}
		return _modules[ id ];
	}

	/**
	 * Define a module which can be later required (imported) using require().
	 *
	 * @param {string} id Defined module id.
	 * @param {Object} obj Defined module body, can be any JavaScript object.
	 */
	function define( id, obj ) {
		if ( _modules[ id ] ) {
			throw new Error( 'Module already exists: ' + id );
		}
		_modules[ id ] = obj;
	}

	function message( name, arg1 ) {
		var msg;
		msg = mwMobileFrontendConfig.messages[ name ];
		if ( msg ) {
			if ( arg1 ) {
				msg = msg.replace( '$1', arg1 );
			}
		} else if ( mw.msg ) {
				msg = mw.msg( name, arg1 );
		} else {
			// no need for translation user should never see this
			throw 'bad key given: ' + name;
		}
		return msg;
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

	// FIXME: deprecate and remove in favor of define()
	function registerModule( moduleName, module ) {
		modules.push( moduleName );
		if ( module ) {
			moduleNamespace[ moduleName ] = module;
		} else { // for backwards compatibility
			moduleNamespace[ moduleName ] = mw.mobileFrontend[ moduleName ];
		}
	}

	// FIXME: deprecate and remove in favor of require()
	function getModule( name ) {
		return moduleNamespace[ name ] || mw.mobileFrontend[ name ];
	}

	/**
	 * @deprecated
	 */
	function initModules() {
		var module, i;
		for( i = 0; i < modules.length; i++ ) {
			module = getModule( modules[ i ] );
			if( module && module.init ) {
				try {
					module.init();
				} catch( e ) {
					// module failed to load for some reason
				}
			}
		}
		u( document.documentElement ).removeClass( 'page-loading' );
		if ( typeof jQuery !== 'undefined' ) {
			$( window ).trigger( 'mw-mf-ready' );
			$.toJSON = typeof JSON !== 'undefined' ? JSON.stringify : $.noop; // FIXME: mediawiki provides jquery-json.js which some modules expect
		}
	}

	// Try to scroll and hide URL bar
	scrollY = window.scrollY || 0;
	if( !window.location.hash && scrollY < 10 ) {
		window.scrollTo( 0, 1 );
	}

	function triggerPageReadyHook( pageTitle, sectionData, anchorSection ) {
		if ( $ ) {
			$( window ).trigger( 'mw-mf-page-loaded', [ {
				title: pageTitle, data: sectionData, anchorSection: anchorSection
			} ] );
		}
	}

	// TODO: separate main menu navigation code into separate module
	function init() {
		var mainPage = document.getElementById( 'mainpage' );

		if ( $ && mainPage ) {
			$( window ).trigger( 'mw-mf-homepage-loaded' );
		}

		if( supportsPositionFixed() ) {
			u( doc ).addClass( 'supportsPositionFixed' );
		}

		// when rotating to landscape stop page zooming on ios
		// allow disabling of transitions in android ics 4.0.2
		function fixBrowserBugs() {
			// see http://adactio.com/journal/4470/
			var viewportmeta = document.querySelector && document.querySelector( 'meta[name="viewport"]' ),
				doc = document.documentElement,
				ua = navigator.userAgent,
				android = ua.match( /Android/ );
			if( viewportmeta && ua.match( /iPhone|iPad/i )  ) {
				viewportmeta.content = 'minimum-scale=1.0, maximum-scale=1.0';
				document.addEventListener( 'gesturestart', function() {
					viewportmeta.content = 'minimum-scale=0.25, maximum-scale=1.6';
				}, false );
			} else if( ua.match(/Android 4\.0\.2/) ){
				u( doc ).addClass( 'android4-0-2' );
			}
			if ( android ) {
				u( doc ).addClass( 'android' );
			}
		}
		fixBrowserBugs();

		// FIXME: deprecate and remove (modules should init themselves)
		initModules();
		// FIXME: kill with fire when dynamic sections are in stable
		if ( !getConfig( 'beta' ) ) {
			triggerPageReadyHook( getConfig( 'title' ) );
		}
	}

	u = typeof jQuery !== 'undefined' ? jQuery : jQueryShim;

	function getConfig( name, defaultValue ) {
		if ( mwMobileFrontendConfig.settings[ name ] !== undefined ) {
			return mwMobileFrontendConfig.settings[ name ];
		} else if ( defaultValue !== undefined ) {
			return defaultValue;
		}
		return null;
	}

	function setConfig( name, value ) {
		mwMobileFrontendConfig.settings[ name ] = value;
	}

	// FIXME: remove when we use api module everywhere
	/**
	 * @deprecated
	 */
	function getApiUrl() {
		return getConfig( 'scriptPath', '' ) + '/api.php';
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
		return getConfig( 'authenticated', false );
	}

	function getOrigin() {
		return window.location.protocol + '//' + window.location.hostname;
	}

	function prettyEncodeTitle( title ) {
		return encodeURIComponent( title.replace( / /g, '_' ) ).replace( /%3A/g, ':' ).replace( /%2F/g, '/' );
	}

	// FIXME: sandbox from mf-application.js
	function log( schemaName, data ) {
		if ( getConfig( 'beta' ) && mw.eventLog ) {
			mw.eventLog.logEvent( schemaName, data );
		}
	}

	return {
		init: init,
		jQuery: typeof jQuery  !== 'undefined' ? jQuery : false,
		getApiUrl: getApiUrl,
		getModule: getModule,
		getOrigin: getOrigin,
		getPageArrayFromApiResponse: getPageArrayFromApiResponse,
		isLoggedIn: isLoggedIn,
		log: log,
		message: message,
		prefix: 'mw-mf-',
		registerModule: registerModule,
		getConfig: getConfig,
		setConfig: setConfig,
		supportsPositionFixed: supportsPositionFixed,
		triggerPageReadyHook: triggerPageReadyHook,
		prettyEncodeTitle: prettyEncodeTitle,
		utils: u,
		require: require,
		define: define
	};

}());
