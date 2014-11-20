( function ( M, $ ) {
	function log( data ) {
		var options = {
			pageId: mw.config.get( 'wgArticleId' ),
			mobileMode: M.getMode()
		};
		return M.log( 'MobileWebWikiGrokError', $.extend( options, data ) );
	}

	M.define( 'loggingSchemas/mobileWebWikiGrokError', {
		log: log
	} );

} )( mw.mobileFrontend, jQuery );
