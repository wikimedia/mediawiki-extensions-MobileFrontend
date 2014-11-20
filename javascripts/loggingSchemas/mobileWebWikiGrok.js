( function ( M, $ ) {
	var user = M.require( 'user' );

	function log( data ) {
		var options = {
			pageId: mw.config.get( 'wgArticleId' ),
			mobileMode: M.getMode(),
			isLoggedIn: !user.isAnon()
		};
		// If the user is logged in, record username and edit count
		if ( !user.isAnon() && typeof user.getEditCount() === 'number' ) {
			options.userEditCount = user.getEditCount();
		}
		return M.log( 'MobileWebWikiGrok', $.extend( options, data ) );
	}

	M.define( 'loggingSchemas/mobileWebWikiGrok', {
		log: log
	} );

} )( mw.mobileFrontend, jQuery );
