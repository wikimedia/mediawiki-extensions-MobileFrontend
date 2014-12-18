( function ( M, $ ) {
	var user = M.require( 'user' );

	/**
	 * FIXME: Use Class/inheritance for EventLogging
	 * Log event to MobileWebWikiGrok.
	 * @param {Object} data to extend the default options with
	 * @returns {jQuery.Deferred}
	 * @ignore
	 */
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
