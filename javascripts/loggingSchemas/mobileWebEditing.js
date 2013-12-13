( function( M, $ ) {
	var user = M.require( 'user' );

	function log( data ) {
		var options = {
				token: M.getSessionId(),
				namespace: mw.config.get( 'wgNamespaceNumber' ),
				userEditCount: user.getEditCount(),
				isTestA: M.isTestA,
				pageId: mw.config.get( 'wgArticleId' ),
				username: user.getName(),
				mobileMode: mw.config.get( 'wgMFMode' ),
				userAgent: window.navigator.userAgent
			};
		return M.log( 'MobileWebEditing', $.extend( options, data ) );
	}

	M.define( 'loggingSchemas/mobileWebEditing', {
		log: log
	} );

} )( mw.mobileFrontend, jQuery );
