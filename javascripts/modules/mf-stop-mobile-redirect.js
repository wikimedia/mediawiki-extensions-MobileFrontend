/*
FIXME: please document purpose of this
*/

( function( M, $ ) {

	var
		writeCookie = M.settings.writeCookie;

	function desktopViewClick() {
		// get mf_mobileFormat cookie info
		var useFormatCookie = mw.config.get( 'wgUseFormatCookie' ),
			redirectCookie = mw.config.get( 'wgStopMobileRedirectCookie' );

		// expire the mf_mobileFormat cookie
		writeCookie( useFormatCookie.name, '', useFormatCookie.duration,
			useFormatCookie.path, useFormatCookie.domain );

		// set the stopMobileRedirect cookie
		writeCookie( redirectCookie.name, 'true', redirectCookie.duration,
			redirectCookie.path, redirectCookie.domain );
	}

	$( '#mw-mf-display-toggle' ).on( 'click', desktopViewClick );

}( mw.mobileFrontend, jQuery ) );
