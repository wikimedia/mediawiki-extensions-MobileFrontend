( function( M ) {
	if ( M.query.campaign === 'mobile-keepgoing' ) {
		mw.loader.using( 'mobile.keepgoing', function() {
			var KeepGoingDrawer = M.require( 'modules/keepgoing/KeepGoingDrawer' );
			// deal with case when campaign_step is undefined
			new KeepGoingDrawer( { tryAgain: true } );
		} );
	}
}( mw.mobileFrontend ) );
