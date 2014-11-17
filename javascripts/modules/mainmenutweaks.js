/*
 * Disables functionality that is not supported by the app
 */
( function ( M, $ ) {
	if ( !M.supportsGeoLocation() ) {
		$( '#mw-mf-page-left li.icon-nearby' ).remove();
	}

} )( mw.mobileFrontend, jQuery );
