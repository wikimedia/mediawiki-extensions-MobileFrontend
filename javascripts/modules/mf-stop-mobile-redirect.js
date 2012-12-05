/*
FIXME: please document purpose of this
Seems to only run when hookOptions is set on SkinMobile class with a key toggle_view_desktop also set
*/

( function( M ) {

var m = ( function() {
	var
		u = M.utils,
		s = M.getConfig,
		writeCookie = M.settings.writeCookie;

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
		u( document.getElementById( 'mw-mf-display-toggle' ) ).bind( 'click', desktopViewClick );
	}

	return {
		init: init
	};
}() );

M.registerModule( 'desktop-redirect', m );

}( mw.mobileFrontend ) );
