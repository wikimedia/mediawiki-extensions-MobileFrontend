/*
 * Warn people if they're trying to switch to desktop but have cookies disabled.
 */

( function ( M, $ ) {

	var settings = M.require( 'settings' ),
		cookiesEnabled = settings.cookiesEnabled,
		popup = M.require( 'toast' );

	/**
	 * An event handler for the toggle to desktop link.
	 * If cookies are enabled it will redirect you to desktop site as described in
	 * the link href associated with the handler.
	 * If cookies are not enabled, show a toast and die.
	 * @method
	 * @ignore
	 * @returns {Boolean|undefined}
	 */
	function desktopViewClick() {
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
