/**
 * Handle cookies for switching from mobile -> desktop mode
 *
 * Sets stopMobileRedirect cookie and, if present, unsets the cookie defined
 * by wgUseFormatCookie (which is used on sites that do not have a separate
 * mobile domain to keep users on the mobile version of the site).
 *
 * We have backend code to handle this too, however if a user is sent to a
 * cached page, the PHP code that handles this will not get executed. Hence
 * this JS. The altnernative would be to send users to a SpecialPage (which
 * is not cached) to handle updating the cookeis prior to redirecting them
 * to the desktop site.
 */

( function( M, $ ) {

	var
		writeCookie = M.settings.writeCookie;

	function desktopViewClick() {
		// get info from cookie defined by wgUseFormatCookie
		var useFormatCookie = mw.config.get( 'wgUseFormatCookie' ),
			redirectCookie = mw.config.get( 'wgStopMobileRedirectCookie' );

		// expire the cookie defined by wgUseFormatCookie
		writeCookie( useFormatCookie.name, '', useFormatCookie.duration,
			useFormatCookie.path, useFormatCookie.domain );

		// set the stopMobileRedirect cookie
		writeCookie( redirectCookie.name, 'true', redirectCookie.duration,
			redirectCookie.path, redirectCookie.domain );
	}

	$( '#mw-mf-display-toggle' ).on( 'click', desktopViewClick );

}( mw.mobileFrontend, jQuery ) );
