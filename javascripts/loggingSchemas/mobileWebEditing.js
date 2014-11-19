( function ( M, $ ) {
	var user = M.require( 'user' );

	function log( data ) {
		var options = {
			token: M.getSessionId(),
			revId: mw.config.get( 'wgRevisionId' ),
			namespace: mw.config.get( 'wgNamespaceNumber' ),
			userEditCount: user.getEditCount() || 0,
			isTestA: M.isTestA,
			pageId: mw.config.get( 'wgArticleId' ),
			username: user.getName() || '',
			mobileMode: M.getMode()
		};
		return M.log( 'MobileWebEditing', $.extend( options, data ) );
	}

	M.define( 'loggingSchemas/mobileWebEditing', {
		log: log
	} );

} )( mw.mobileFrontend, jQuery );
