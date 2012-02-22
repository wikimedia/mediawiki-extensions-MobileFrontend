/*global document, window */
/*jslint sloppy: true, white:true, maxerr: 50, indent: 4, plusplus: true*/
/*
TODO: getElementsByClassName not supported by IE < 9
TODO: addEventListener not supported by IE < 9
*/
MobileFrontend = (function() {

	function init() {
		var i, search, clearSearch, results, languageSelection, a,
			sectionHeadings = document.getElementsByClassName( 'section_heading' ),
			dismissNotification, cookieNameZeroVisibility, zeroRatedBanner, zeroRatedBannerVisibility;
		utilities( document.body ).addClass( 'jsEnabled' );
		function openSectionHandler() {
			var sectionNumber = this.id ? this.id.split( '_' )[1] : -1;
			if( sectionNumber > -1 ) {
				wm_toggle_section( sectionNumber );
			}
		}
		for( i = 0; i < sectionHeadings.length; i++ ) {
			utilities( sectionHeadings[i] ).bind( 'click', openSectionHandler, false );
		}
		search = document.getElementById( 'search' );
		clearSearch = document.getElementById( 'clearsearch' );
		results = document.getElementById( 'results' );
		languageSelection = document.getElementById( 'languageselection' );

		zeroRatedBanner = document.getElementById( 'zero-rated-banner' ) ||
			document.getElementById( 'zero-rated-banner-red' );

		function initClearSearchLink() {
			function onFocusHandler() {
				search.select();
			}
			clearSearch.setAttribute( 'title', 'Clear' );
			utilities( clearSearch ).bind( 'mousedown', clearSearchBox, true );
			utilities( search ).bind( 'keyup', handleClearSearchLink, false );
			utilities( search ).bind( 'keydown', handleDefaultText, false );
			utilities( search ).bind( 'click', onFocusHandler, true );
		}

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

		function handleDefaultText() {
			var pE = document.getElementById( 'placeholder' );
			if ( pE ) {
				pE.style.display = 'none';
			}
		}

		function handleClearSearchLink() {
			if ( clearSearch ) {
				if ( search.value.length > 0 ) {
					clearSearch.style.display = 'block';
				} else {
					clearSearch.style.display = 'none';
				}
			}
		}

		function clearSearchBox( event ) {
			search.value = '';
			clearSearch.style.display = 'none';
			if ( event ) {
				event.preventDefault();
			}
		}

		function logoClick() {
			var n = document.getElementById( 'nav' ).style;
			n.display = n.display === 'block' ? 'none' : 'block';
		}
		initClearSearchLink();
		search.onpaste = function() {
			handleDefaultText();
		};
		utilities( document.getElementById( 'logo' ) ).bind( 'click', logoClick );
		dismissNotification = document.getElementById( 'dismiss-notification' );

		if ( dismissNotification ) {
			cookieNameZeroVisibility = 'zeroRatedBannerVisibility';
			zeroRatedBanner = document.getElementById( 'zero-rated-banner' );
			zeroRatedBannerVisibility = readCookie( cookieNameZeroVisibility );

			if ( zeroRatedBannerVisibility === 'off' ) {
				zeroRatedBanner.style.display = 'none';
			}

			dismissNotification.onclick = function() {
				if ( zeroRatedBanner ) {
					zeroRatedBanner.style.display = 'none';
					writeCookie( cookieNameZeroVisibility, 'off', 1 );
				}
			};
		}

		function checkHash() {
			var hash = this.hash || document.location.hash;
			if ( hash.indexOf( '#' ) === 0 ) {
				wm_reveal_for_hash( hash );
			}
		}
		checkHash();
		for ( a = document.getElementsByTagName( 'a' ), i = 0; i < a.length; i++ ) {
			utilities( a[i] ).bind( 'click', checkHash );
		}

		// Try to scroll and hide URL bar
		window.scrollTo( 0, 1 );
	}
	init();

	function wm_reveal_for_hash( hash ) {
		var targetel = document.getElementById( hash.substr(1) ),
			p, section_idx;
		if ( targetel ) {
			p = targetel;
			while ( p && p.className !== 'content_block' && 
				p.className !== 'section_heading' ) {
				p = p.parentNode;
			}
			if ( p && p.style.display !== 'block' ) {
				section_idx = parseInt( p.id.split( '_' )[1], 10 );
				wm_toggle_section( section_idx );
			}
		}
	}

	function wm_toggle_section( section_id ) {
		var b = document.getElementById( 'section_' + section_id ),
			bb = b.getElementsByTagName( 'button' ), i, s, e;
		for ( i = 0; i <= 1; i++ ) {
			s = bb[i].style;
			s.display = s.display === 'none' || ( i && !s.display ) ? 'inline-block' : 'none';
		}
		for ( i = 0, d = ['content_','anchor_']; i<=1; i++ ) {
			e = document.getElementById( d[i] + section_id );
			if ( e ) {
				e.style.display = e.style.display === 'block' ? 'none' : 'block';
			}
		}
	}

	function writeCookie( name, value, days ) {
		var date, expires;
		if ( days ) {
			date = new Date();
			date.setTime( date.getTime() + ( days * 24 * 60 * 60 *1000 ) );
			expires = '; expires=' + date.toGMTString();
		} else {
			expires = '';
		}
		document.cookie = name + '=' + value + expires + '; path=/';
	}

	function readCookie( name ) {
		var nameVA = name + '=',
			ca = document.cookie.split( ';' ),
			c, i;
		for( i=0; i < ca.length; i++ ) {
			c = ca[i];
			while ( c.charAt(0) === ' ' ) {
				c = c.substring( 1, c.length );
			}
			if ( c.indexOf( nameVA ) === 0 ) {
				return c.substring( nameVA.length, c.length );
			}
		}
		return null;
	}

	function removeCookie( name ) {
		writeCookie( name, '', -1 );
		return null;
	}

	function utilities( el ) {
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
		return {
			addClass: addClass,
			bind: bind,
			removeClass: removeClass
		};
	}
	utilities.ajax = function( options ) {
		var xmlHttp, url;
		if ( window.XMLHttpRequest ) {
			xmlHttp = new XMLHttpRequest();
		} else {
			xmlHttp = new ActiveXObject( 'Microsoft.XMLHTTP' );
		}
		xmlHttp.overrideMimeType( 'text/xml' );
		xmlHttp.onreadystatechange = function() {
			if ( xmlHttp.readyState === 4 && xmlHttp.status === 200 ) {
				options.success( xmlHttp.responseXML );
			}
		};
		xmlHttp.open( 'GET', options.url, true );
		xmlHttp.send();
	};

	return {
		readCookie: readCookie,
		writeCookie: writeCookie,
		removeCookie: removeCookie,
		wm_reveal_for_hash: wm_reveal_for_hash,
		wm_toggle_section: wm_toggle_section,
		init: init,
		utils: utilities
	};

}());
