( function ( M, $ ) {
	var
		user = M.require( 'user' ),
		PhotoList = M.require( 'modules/gallery/PhotoList' ),
		pageParams = mw.config.get( 'wgPageName' ).split( '/' ),
		currentUserName = user.getName(),
		userName = pageParams[1] ? pageParams[1] : currentUserName;

	/**
	 * Initialise a photo upload button at the top of the page.
	 * @ignore
	 */
	function init() {
		// check there are no errors on the page before attempting
		// we might have an invalid username
		if ( $( '.errorbox' ).length === 0 ) {
			new PhotoList( {
				username: userName
			} ).appendTo( '.content' );
		}
	}

	// Assume we are on the special page.
	if ( userName ) {
		$( init );
	}

}( mw.mobileFrontend, jQuery ) );
