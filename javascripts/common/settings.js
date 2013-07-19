( function( M ) {

M.settings = ( function() {
	var supportsLocalStorage;

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

	function getUserSetting( name, useCookieFallback ) {
		return supportsLocalStorage ? localStorage.getItem( name ) :
			( useCookieFallback ? readCookie( name ) : false );
	}

	return {
		getUserSetting: getUserSetting,
		readCookie: readCookie,
		removeCookie: removeCookie,
		saveUserSetting: saveUserSetting,
		supportsLocalStorage: supportsLocalStorage,
		writeCookie: writeCookie
	};
}());

}( mw.mobileFrontend ));
