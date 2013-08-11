( function( M, $ ) {
	var CtaDrawer = M.require( 'CtaDrawer' ), drawer;

	if ( !M.isLoggedIn() ) {
		drawer = new CtaDrawer( {
			content: mw.msg( 'mobile-frontend-user-cta' )
		} );

		// FIXME change when micro.tap.js in stable
		$( '#user-button' ).on( mw.config.get( 'wgMFMode' ) === 'alpha' ? 'tap' : 'click', function( ev ) {
			ev.preventDefault();
			drawer.show();
		} );
	}
}( mw.mobileFrontend, jQuery ) );
