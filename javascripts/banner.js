/*global document, window, mw, navigator, clearTimeout, setTimeout */
/*jslint sloppy: true, white:true, maxerr: 50, indent: 4, plusplus: true */
(function( MobileFrontend ) {
MobileFrontend.banner = (function() {
	function init() {
		var dismissNotification, cookieNameZeroVisibility, zeroRatedBanner,
			writeCookie = MobileFrontend.settings.writeCookie,
			readCookie = MobileFrontend.settings.readCookie,
			zeroRatedBannerVisibility;
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

	init();
	return {
		init: init
	};
}());
}( mw.mobileFrontend ));
