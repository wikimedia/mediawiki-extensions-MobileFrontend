( function( M ) {
	M.assertMode( [ 'alpha' ] );

	if ( M.query.campaign === 'random' ) {
		mw.loader.using( 'mobile.keepgoing', function() {
			var KeepGoingDrawer = M.require( 'modules/keepgoing/KeepGoingDrawer' );
			new KeepGoingDrawer( {
				campaign: 'random',
				msg: mw.msg( 'mobilefrontend-random-explain' ),
				cancel: mw.msg( 'mobilefrontend-random-cancel' )
			} );
		} );
	}

}( mw.mobileFrontend ) );
