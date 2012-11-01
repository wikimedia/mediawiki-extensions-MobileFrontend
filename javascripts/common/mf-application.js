/*global document, window, mw, navigator, mwMobileFrontendConfig, jQuery */
/*jslint sloppy: true, white:true, maxerr: 50, indent: 4, plusplus: true, sub:true */
/* some polyfill */
if( typeof Array.prototype.forEach === 'undefined' ) {
	Array.prototype.forEach = function( callback ) {
		var i;
		for( i = 0; i < this.length; i++ ) {
			callback( this[ i ], i );
		}
	};
}
mw.mobileFrontend = (function() {
	var utilities, modules = [],
		scrollY, tokenQuery = {},
		moduleNamespace = {},
		doc = document.documentElement;

	function message( name, arg1 ) {
		var msg = mwMobileFrontendConfig.messages[name] || '';
		if ( arg1 ) {
			msg = msg.replace( '$1', arg1 );
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
		supportedAgents.forEach( function( item, i ) {
			if( agent.match( item ) ) {
				support = true;
			}
		} );
		return support;
	}

	function registerModule( moduleName, module ) {
		modules.push( moduleName );
		if ( module ) {
			moduleNamespace[ moduleName ] = module;
		} else { // for backwards compatibility
			moduleNamespace[ moduleName ] = mw.mobileFrontend[ moduleName ];
		}
	}

	function getModule( name ) {
		return moduleNamespace[ name ] || mw.mobileFrontend[ name ];
	}

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
		utilities( document.documentElement ).removeClass( 'page-loading' );
		if ( typeof jQuery !== 'undefined' ) {
			$( window ).trigger( 'mw-mf-ready' );
		}
	}

	// Try to scroll and hide URL bar
	scrollY = window.scrollY || 0;
	if( !window.location.hash && scrollY < 10 ) {
		window.scrollTo( 0, 1 );
	}

	// TODO: separate main menu navigation code into separate module
	function init() {
		var languageSelection, contentEl = document.getElementById( 'content' ),
			mainPage = document.getElementById( 'mainpage' ),
			h2;

		if( mainPage && mainPage.childNodes.length === 0 && message( 'empty-homepage' ) ) {
			h2 = document.createElement( 'h2' );
			h2.innerHTML = message( 'empty-homepage' );
			mainPage.appendChild( h2 );
		}

		if( supportsPositionFixed() ) {
			utilities( doc ).addClass( 'supportsPositionFixed' );
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
				utilities( doc ).addClass( 'android4-0-2' );
			}
			if ( android ) {
				utilities( doc ).addClass( 'android' );
			}
		}
		fixBrowserBugs();

		initModules();
	}

	utilities = typeof jQuery !== 'undefined' ? jQuery : function ( el ) {
		if ( typeof el === 'string' ) {
			if ( document.querySelectorAll ) {
				return [].slice.call( document.querySelectorAll( el ) );
			}
		} else if ( !el ) {
			el = document.createElement( 'div' );
		}

		function inArray( array, str ) {
			var i;
			if ( array.indexOf ) {
				return array.indexOf( str ) > -1;
			} else {
				for ( i = 0; i < array.length; i++ ) {
					if ( str === array[i] ) {
						return true;
					}
				}
				return false;
			}
		}

		function hasClass( name ) {
			var classNames = el.className.split( ' ' );
			return inArray( classNames, name );
		}

		function addClass( name ) {
			var className = el.className,
				classNames = className.split( ' ' );
			classNames.push( name ); // TODO: only push if unique
			el.className = classNames.join( ' ' );
		}

		function removeClass( name ) {
			var className = el.className,
				classNames = className.split( ' ' ),
				newClasses = [], i;
			for ( i = 0; i < classNames.length; i++ ) {
				if ( classNames[i] !== name ) {
					newClasses.push( classNames[i] );
				}
			}
			el.className = newClasses.join( ' ' );
		}

		function bind( type, handler ) {
			el.addEventListener( type, handler, false );
		}

		function remove() {
			el.parentNode.removeChild( el );
		}

		function getChildText( el ) {
			var child, value = '', i;
			for ( i = 0; i < el.childNodes.length; i++ ) {
				child = el.childNodes[i];
				if ( child.nodeType !== 8 ) { // ignore comment node
					value += utilities( child ).text();
				}
			}
			return value;
		}

		function text( str ) {
			var i, label;
			if ( str ) {
				label = document.createTextNode( str );
				el.appendChild( label );
			} else {
				if ( el.nodeType === 3 ) { // TEXT_NODE
					return el.nodeValue;
				} else if ( typeof el.textContent === 'string' ) {
					return el.textContent; // standards compliant
				} else if ( typeof el.innerText === 'string' ) {
					return el.innerText;
				} else {
					return getChildText( el );
				}
			}
		}

		return {
			addClass: addClass,
			bind: bind,
			hasClass: hasClass,
			remove: remove,
			removeClass: removeClass,
			text: text
		};
	};
	utilities.ajax = utilities.ajax || function( options ) {
		var xmlHttp, url;
		if ( window.XMLHttpRequest ) {
			xmlHttp = new XMLHttpRequest();
		} else {
			xmlHttp = new ActiveXObject( 'Microsoft.XMLHTTP' );
		}
		if( xmlHttp.overrideMimeType ) { // non standard
			xmlHttp.overrideMimeType( 'text/xml' );
		}
		xmlHttp.onreadystatechange = function() {
			var resp;
			if ( xmlHttp.readyState === 4 && xmlHttp.status === 200 ) {
				if ( options && options.dataType === 'json' ) {
					resp = xmlHttp.responseText;
					resp = resp && typeof JSON !== 'undefined' ? JSON.parse( resp ) : resp;
				} else {
					resp = xmlHttp.responseXML;
				}
				options.success( resp );
			}
		};
		xmlHttp.open( 'GET', options.url, true );
		xmlHttp.send();
	};

	function setting( name ) {
		return mwMobileFrontendConfig.settings[name] || '';
	}

	function getApiUrl() {
		return setting( 'scriptPath' ) + '/api.php';
	}

	function isLoggedIn() {
		return setting( 'authenticated' );
	}

	function getToken( tokenType, callback ) {
		var data;
		if ( !isLoggedIn() ) {
			callback( {} ); // return no token
		} else if ( tokenQuery.hasOwnProperty( tokenType ) ) {
			tokenQuery[ tokenType ].done( callback );
		} else {
			data = {
				format: 'json',
				action: 'tokens',
				type: tokenType
			};
			tokenQuery[ tokenType ] = jQuery.ajax( {
				url: getApiUrl(),
				dataType: 'json',
				data: data
			} ).done( callback );
		}
	}

	return {
		init: init,
		jQuery: typeof jQuery  !== 'undefined' ? jQuery : false,
		getApiUrl: getApiUrl,
		getModule: getModule,
		getToken: typeof jQuery  !== 'undefined' ? getToken : false,
		message: message,
		prefix: 'mw-mf-',
		registerModule: registerModule,
		setting: setting,
		supportsPositionFixed: supportsPositionFixed,
		utils: utilities
	};

}());
