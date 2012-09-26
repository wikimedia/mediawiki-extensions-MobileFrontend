/*global document, window, mw, navigator, clearTimeout, setTimeout */
/*jslint sloppy: true, white:true, maxerr: 50, indent: 4, plusplus: true */
( function( MobileFrontend, $ ) {
MobileFrontend.banner = (function() {
	function init( banner ) {
		var cookieNameZeroVisibility = banner ? banner.getAttribute( 'id' ) : 'zeroRatedBannerVisibility',
			M = MobileFrontend,
			settings = M.getModule( 'settings' ),
			saveUserSetting = settings.saveUserSetting,
			getUserSetting = settings.getUserSetting,
			dismissNotification = banner ? banner.getElementsByTagName( 'button' )[ 0 ] : document.getElementById( 'dismiss-notification' );

		banner = banner || document.getElementById( 'zero-rated-banner' ) ||
			document.getElementById( 'zero-rated-banner-red' );

		if ( dismissNotification ) {
			zeroRatedBannerVisibility = getUserSetting( cookieNameZeroVisibility );

			if ( zeroRatedBannerVisibility === 'off' ) {
				banner.style.display = 'none';
			}

			dismissNotification.onclick = function() {
				banner.parentNode.removeChild( banner );
				saveUserSetting( cookieNameZeroVisibility, 'off',
					// FIXME: currently we only resort to cookie saving for the zero rated banners to avoid cache fragmentation
					// (this has side effect that any banners shown on pages which do not support localStorage are not supported)
					'zeroRatedBannerVisibility' === cookieNameZeroVisibility );
			};
		}
	}

	if ( MobileFrontend.jQuery ) {
		$( '.mw-mf-banner' ).each( function() {
			$( '<button class="notify-close">' ).text( '×' ).appendTo( this );
			init( this );
		} );
	}

	// TODO: this is only here for legacy reasons - ZeroRatedMobileAccess extension should be refactored to serve generic banners
	init();
	return {
		init: init
	};
}());
}( mw.mobileFrontend, jQuery ));
