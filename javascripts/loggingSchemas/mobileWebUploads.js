( function( M, $ ) {
	var user = M.require( 'user' );
	function getLog( funnel ) {
		return function( data ) {
			if ( mw.config.get( 'wgArticleId', -1 ) !== -1 ) {
				data.pageId = mw.config.get( 'wgArticleId' );
			}

			M.log( 'MobileWebUploads', $.extend( {
				token: M.getSessionId(),
				funnel: funnel,
				username: user.getName(),
				isEditable: mw.config.get( 'wgIsPageEditable' ),
				mobileMode: mw.config.get( 'wgMFMode' )
			}, data ) );
		};
	}

	M.define( 'loggingSchemas/mobileWebUploads', { getLog: getLog } );

}( mw.mobileFrontend, jQuery ) );
