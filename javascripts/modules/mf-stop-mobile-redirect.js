/*
 * Warn people if they're trying to switch to desktop but have cookies disabled.
 */

( function ( M, $ ) {

	var settings = M.require( 'settings' ),
		cookiesEnabled = settings.cookiesEnabled,
		popup = M.require( 'toast' );

	function desktopViewClick() {
		// If cookies are not enabled, show a toast and die
		if ( !cookiesEnabled() ) {
			popup.show(
				mw.msg( 'mobile-frontend-cookies-required' ),
				'toast error'
			);
			// Prevent default action
			return false;
		}
	}

	$( '#mw-mf-display-toggle' ).on( 'click', desktopViewClick );

}( mw.mobileFrontend, jQuery ) );
