( function( M, $ ) {

	function log( data ) {
		var options = {
				token: M.getSessionId(),
				namespace: mw.config.get( 'wgNamespaceNumber' ),
				userEditCount: mw.config.get( 'wgUserEditCount' ),
				isTestA: M.isTestA,
				pageId: mw.config.get( 'wgArticleId' ),
				username: mw.config.get( 'wgUserName' ),
				mobileMode: mw.config.get( 'wgMFMode' ),
				userAgent: window.navigator.userAgent
			};
		return M.log( 'MobileWebEditing', $.extend( options, data ) );
	}

	M.define( 'loggingSchemas/mobileWebEditing', {
		log: log
	} );

} )( mw.mobileFrontend, jQuery );
