/**
 * mainmenutweaks.js
 * Disables functionality that is not supported by the app
 */
( function( M, $ ) {
	var photo = M.require( 'photo' );

	if ( !photo.isSupported() ) {
		// FIXME: We want to enable it to these users however we must first deal with what to show
		// to users who haven't uploaded anything to make the page useful.
		$( '#mw-mf-menu-main li.icon-uploads' ).remove();
	}

} )( mw.mobileFrontend, jQuery );
