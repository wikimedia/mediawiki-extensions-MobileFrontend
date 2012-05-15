/*global document, window */
/*jslint sloppy: true, white:true, maxerr: 50, indent: 4, plusplus: true*/
MobileFrontend = (function() {
	var utilities, modules = [], browserScore = 2000;

	function getBrowserScore() {
		return browserScore;
	}

	function message( name ) {
		return mwMobileFrontendConfig.messages[name] || '';
	}

	function registerModule( module, minScore ) {
		modules.push( [ module, minScore ] );
	}

	function initModules() {
		var module, i;
		for( i = 0; i < modules.length; i++ ) {
			module = modules[ i ];
			minScore = module[ 1 ];
			if( typeof minScore === 'undefined' || getBrowserScore() > minScore ) {
				module = MobileFrontend[ module[ 0 ] ];
				if( module && module.init ) {
					module.init();
				}
			}
		}
		utilities( document.documentElement ).removeClass( 'page-loading' );
	}
	// TODO: separate main menu navigation code into separate module
	function init() {
		var languageSelection, contentEl = document.getElementById( 'content' ),
			mainPage = document.getElementById( 'mainpage' ),
			scrollY;

		if( mainPage && mainPage.childNodes.length === 0 && message( 'empty-homepage' ) ) {
			contentEl.innerHTML = message( 'empty-homepage' );
		}

		languageSelection = document.getElementById( 'languageselection' );

		function navigateToLanguageSelection() {
			var url;
			if ( languageSelection ) {
				url = languageSelection.options[languageSelection.selectedIndex].value;
				if ( url ) {
					location.href = url;
				}
			}
		}
		utilities( languageSelection ).bind( 'change', navigateToLanguageSelection );

		function logoClick() {
			var n = document.getElementById( 'nav' ).style;
			n.display = n.display === 'block' ? 'none' : 'block';
		}
		utilities( document.getElementById( 'logo' ) ).bind( 'click', logoClick );

		function desktopViewClick() {
			// get mf_mobileFormat cookie info
			var formatCookieName = MobileFrontend.setting( 'useFormatCookieName' ),
				formatCookieDuration = MobileFrontend.setting( 'useFormatCookieDuration' ),
				cookiePath = MobileFrontend.setting( 'useFormatCookiePath' ),
				formatCookieDomain = MobileFrontend.setting( 'useFormatCookieDomain' ),
				stopMobileRedirectCookieName, stopMobileRedirectCookieDuration, stopMobileRedirectCookieDomain,
				hookOptions;

			// convert from seconds to days
			formatCookieDuration = formatCookieDuration / ( 24 * 60 * 60 );

			// expire the mf_mobileFormat cookie
			MobileFrontend.banner.writeCookie( formatCookieName, '', formatCookieDuration, cookiePath, formatCookieDomain );

			// get stopMobileRedirect cookie info
			stopMobileRedirectCookieName = MobileFrontend.setting( 'stopMobileRedirectCookieName' );
			stopMobileRedirectCookieDuration = MobileFrontend.setting( 'stopMobileRedirectCookieDuration' );
			stopMobileRedirectCookieDomain = MobileFrontend.setting( 'stopMobileRedirectCookieDomain' );
			hookOptions = MobileFrontend.setting( 'hookOptions' );

			// convert from seconds to days
			stopMobileRedirectCookieDuration = stopMobileRedirectCookieDuration / ( 24 * 60 *60 );

			if ( hookOptions !== 'toggle_view_desktop' ) {
				// set the stopMobileRedirect cookie
				MobileFrontend.banner.writeCookie( stopMobileRedirectCookieName, 'true', stopMobileRedirectCookieDuration, cookiePath, stopMobileRedirectCookieDomain );
			}
		}
		utilities( document.getElementById( 'mf-display-toggle' ) ).bind( 'click', desktopViewClick );

		// when rotating to landscape stop page zooming on ios
		// allow disabling of transitions in android ics 4.0.2
		function fixBrowserBugs() {
			// see http://adactio.com/journal/4470/
			var viewportmeta = document.querySelector && document.querySelector( 'meta[name="viewport"]' ),
				ua = navigator.userAgent;
			if( viewportmeta && ua.match( /iPhone|iPad/i )  ) {
				viewportmeta.content = 'minimum-scale=1.0, maximum-scale=1.0';
				document.addEventListener( 'gesturestart', function() {
					viewportmeta.content = 'minimum-scale=0.25, maximum-scale=1.6';
				}, false );
			} else if( ua.match(/Android 4\.0\.2/) ){
				utilities( document.documentElement ).addClass( 'android4-0-2' );
			}
		}
		// scores browser's capability
		// the higher the score the better the browser
		function scoreBrowser() {
			var ua = navigator.userAgent;
			// browsers not capable of search
			if( ua.match( /Opera Mini\/4/ ) ) {
				browserScore = 1000;
			}
		}
		scoreBrowser();
		fixBrowserBugs();

		// Try to scroll and hide URL bar
		scrollY = window.scrollY || 0;
		if( !window.location.hash && scrollY < 10 ) {
			window.scrollTo( 0, 1 );
		}

		initModules();
	}

	utilities = typeof jQuery  !== 'undefined' ? jQuery : function( el ) {
		if( typeof(el) === 'string' ) {
			if( document.querySelectorAll ) {
				return [].slice.call( document.querySelectorAll( el ) );
			}
		} else if( !el ) {
			el = document.createElement( 'div' );
		}

		function inArray( array, str ) {
			var i;
			if( array.indexOf ) {
				return array.indexOf( str ) > -1;
			} else {
				for( i = 0; i < array.length; i++ ) {
					if( str === array[i] ) {
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
			classNames.push(name); // TODO: only push if unique
			el.className = classNames.join( ' ' );
		}

		function removeClass( name ) {
			var className = el.className,
				classNames = className.split( ' ' ),
				newClasses = [], i;
			for( i = 0; i < classNames.length; i++ ) {
				if( classNames[i] !== name ) {
					newClasses.push( classNames[i] );
				}
			}
			el.className = newClasses.join( ' ' );
		}

		function bind( type, handler ) {
			el.addEventListener( type, handler, false );
		}

		function remove() {
			el.parentNode.removeChild(el);
		}

		function getChildText( el ) {
			var child, value = '';
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
			if( str ) {
				label = document.createTextNode( str );
				el.appendChild( label );
			} else {
				if( el.nodeType === 3 ) { // TEXT_NODE
					return el.nodeValue;
				} else if( typeof el.textContent === 'string' ) {
					return el.textContent; // standards compliant
				} else if( typeof el.innerText === 'string' ) {
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
	}
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
			if ( xmlHttp.readyState === 4 && xmlHttp.status === 200 ) {
				options.success( xmlHttp.responseXML );
			}
		};
		xmlHttp.open( 'GET', options.url, true );
		xmlHttp.send();
	};

	return {
		init: init,
		message: message,
		registerModule: registerModule,
		setting: function( name ) {
			return mwMobileFrontendConfig.settings[name] || '';
		},
		utils: utilities
	};

}());
