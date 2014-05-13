( function( M ) {
	M.assertMode( [ 'alpha' ] );

	if ( window.location.hash === '#/random' ) {
		mw.loader.using( 'mobile.random', function() {
			var RandomDrawer = M.require( 'modules/random/RandomDrawer' );
			new RandomDrawer( {
				heading: M.getCurrentPage().title
			} );
		} );
	}

}( mw.mobileFrontend ) );
