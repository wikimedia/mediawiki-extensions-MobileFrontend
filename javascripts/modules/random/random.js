( function( M ) {
	M.assertMode( [ 'alpha' ] );

	if ( M.query.campaign === 'random' ) {
		mw.loader.using( 'mobile.random', function() {
			var RandomDrawer = M.require( 'modules/random/RandomDrawer' );
			new RandomDrawer( {
				campaign: 'random',
				heading: M.getCurrentPage().title
			} );
		} );
	}

}( mw.mobileFrontend ) );
