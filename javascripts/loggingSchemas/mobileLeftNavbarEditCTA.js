( function( M, $ ) {

	function log( data ) {
		var options = {
			userId: mw.config.get( 'wgUserId' ),
			bucket: M.isTestA ? 'test' : 'control',
			mobileMode: mw.config.get( 'wgMFMode' ),
			pageId: mw.config.get( 'wgArticleId' ),
			pageNamespace: mw.config.get( 'wgNamespaceNumber' ),
			isEditable: mw.config.get( 'wgIsPageEditable' ),
			revId: mw.config.get( 'wgRevisionId' )
		};
		return M.log( 'MobileLeftNavbarEditCTA', $.extend( options, data ) );
	}

	M.define( 'loggingSchemas/mobileLeftNavbarEditCTA', {
		log: log
	} );
} )( mw.mobileFrontend, jQuery );
