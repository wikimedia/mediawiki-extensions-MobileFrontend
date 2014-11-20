( function ( M, $ ) {
	var user = M.require( 'user' );

	function getLog( funnel ) {

		function logger( data ) {
			if ( mw.config.get( 'wgArticleId', -1 ) !== -1 ) {
				data.pageId = mw.config.get( 'wgArticleId' );
			}

			M.log( 'MobileWebUploads', $.extend( {
				token: M.getSessionId(),
				funnel: funnel,
				username: user.getName(),
				isEditable: mw.config.get( 'wgIsPageEditable' ),
				mobileMode: M.getMode()
			}, data ) );
		}

		return logger;
	}

	M.define( 'loggingSchemas/mobileWebUploads', {
		getLog: getLog
	} );

}( mw.mobileFrontend, jQuery ) );
