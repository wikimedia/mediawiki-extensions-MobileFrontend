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
		new PhotoList( {
			username: userName
		} ).appendTo( '.content' );
	}

	if ( userName && mw.config.get( 'wgCanonicalSpecialPageName' ) === 'Uploads' ) {
		$( init );
	}

}( mw.mobileFrontend, jQuery ) );
