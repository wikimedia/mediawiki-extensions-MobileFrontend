MobileFrontend.banner = (function() {
	function init() {
		var dismissNotification, cookieNameZeroVisibility, zeroRatedBanner, zeroRatedBannerVisibility;
		dismissNotification = document.getElementById( 'dismiss-notification' );
		if ( dismissNotification ) {
			cookieNameZeroVisibility = 'zeroRatedBannerVisibility';
			zeroRatedBanner = document.getElementById( 'zero-rated-banner' ) ||
				document.getElementById( 'zero-rated-banner-red' );
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
	}

	function writeCookie( name, value, days, path, domain ) {
		var date, expires;
		if ( days ) {
			date = new Date();
			date.setTime( date.getTime() + ( days * 24 * 60 * 60 *1000 ) );
			expires = '; expires=' + date.toGMTString();
		} else {
			expires = '';
		}
		
		if ( typeof path === 'undefined' ) {
			path = "/";
		}

		var cookie = name + '=' + value + expires + '; path=' + path;

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

	init();
	return {
		init: init,
		readCookie: readCookie,
		writeCookie: writeCookie,
		removeCookie: removeCookie
	}
})();
