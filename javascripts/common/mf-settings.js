( function( M ) {

var settings = ( function() {
	var u = M.utils,
		s = M.getConfig,
		supportsLocalStorage;

	// using feature detection used by http://diveintohtml5.info/storage.html
	try {
		supportsLocalStorage = 'localStorage' in window && window.localStorage !== null;
	} catch ( e ) {
		supportsLocalStorage = false;
	}

	function writeCookie( name, value, days, path, domain ) {
		var date, expires, cookie;
		if ( days ) {
			date = new Date();
			date.setTime( date.getTime() + ( days * 24 * 60 * 60 *1000 ) );
			expires = '; expires=' + date.toGMTString();
		} else {
			expires = '';
		}

		if ( typeof path === 'undefined' ) {
			path = '/';
		}

		cookie = name + '=' + value + expires + '; path=' + path;

		if ( typeof domain !== 'undefined' ) {
			cookie = cookie + '; domain=' + domain;
		}
		document.cookie = cookie;
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

	function saveUserSetting( name, value, useCookieFallback ) {
		return supportsLocalStorage ?
			localStorage.setItem( name, value ) :
				( useCookieFallback ? writeCookie( name, value, 1 ) : false );
	}

	function getUserSetting( name ) {
		return supportsLocalStorage ? localStorage.getItem( name ) : readCookie( name );
	}

	function enhanceCheckboxes() {
	u( document.body ).addClass( 'mw-mf-checkboxes' );
		var inputs = document.getElementsByTagName( 'input' ), i, el, special;
		function clickChkBox() {
			var parent = this,
				box = parent.getElementsByTagName( 'input' )[ 0 ];

			if( !u( parent ).hasClass( 'checked' ) ) {
				u( parent ).addClass( 'checked' );
				box.checked = true;
			} else {
				u( parent ).removeClass( 'checked' );
				box.checked = false;
			}
		}
		for( i = 0; i < inputs.length; i++ ) {
			el = inputs[i];
			special = u( el.parentNode ).hasClass( 'mw-mf-checkbox-css3' );
			if( el.getAttribute( 'type' ) === 'checkbox' && special ) {
				u( el.parentNode ).bind( 'click', clickChkBox );
				if( el.checked ) {
					u( el.parentNode ).addClass( 'checked ');
				}
			}
		}
	}

	function desktopViewClick() {
		// get mf_mobileFormat cookie info
		var formatCookieName = s( 'useFormatCookieName' ),
			formatCookieDuration = s( 'useFormatCookieDuration' ),
			cookiePath = s( 'useFormatCookiePath' ),
			formatCookieDomain = s( 'useFormatCookieDomain' ),
			stopMobileRedirectCookieName, stopMobileRedirectCookieDuration, stopMobileRedirectCookieDomain,
			hookOptions;

		// convert from seconds to days
		formatCookieDuration = formatCookieDuration / ( 24 * 60 * 60 );
		// expire the mf_mobileFormat cookie
		writeCookie( formatCookieName, '', formatCookieDuration, cookiePath, formatCookieDomain );

		// get stopMobileRedirect cookie info
		stopMobileRedirectCookieName = s( 'stopMobileRedirectCookieName' );
		stopMobileRedirectCookieDuration = s( 'stopMobileRedirectCookieDuration' );
		stopMobileRedirectCookieDomain = s( 'stopMobileRedirectCookieDomain' );
		hookOptions = s( 'hookOptions' );
		// convert from seconds to days
		stopMobileRedirectCookieDuration = stopMobileRedirectCookieDuration / ( 24 * 60 *60 );

		if ( hookOptions !== 'toggle_view_desktop' ) {
			// set the stopMobileRedirect cookie
			writeCookie( stopMobileRedirectCookieName, 'true', stopMobileRedirectCookieDuration, cookiePath, stopMobileRedirectCookieDomain );
		}
	}

	function init() {
		enhanceCheckboxes();
		u( document.getElementById( 'mw-mf-display-toggle' ) ).bind( 'click', desktopViewClick );
	}

	return {
		init: init,
		getUserSetting: getUserSetting,
		readCookie: readCookie,
		removeCookie: removeCookie,
		saveUserSetting: saveUserSetting,
		writeCookie: writeCookie
	};
}());

M.registerModule( 'settings', settings );

}( mw.mobileFrontend ));
