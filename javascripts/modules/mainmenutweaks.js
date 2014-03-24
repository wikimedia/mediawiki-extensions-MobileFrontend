/**
 * Disables functionality that is not supported by the app
 */
( function( M, $ ) {
	var photo = M.require( 'modules/uploads/PhotoUploaderButton' );

	if ( !photo.isSupported ) {
		// FIXME: We want to enable it to these users however we must first deal with what to show
		// to users who haven't uploaded anything to make the page useful.
		$( '#mw-mf-page-left li.icon-uploads' ).remove();
	}
	if ( !M.supportsGeoLocation() ) {
		$( '#mw-mf-page-left li.icon-nearby' ).remove();
	}

} )( mw.mobileFrontend, jQuery );
