( function( M, $ ) {
	var CtaDrawer = M.require( 'CtaDrawer' ), drawer;

	if ( !M.isLoggedIn() ) {
		drawer = new CtaDrawer( {
			content: mw.msg( 'mobile-frontend-user-cta' )
		} );

		$( '#user-button' ).on( 'click', function( ev ) {
			ev.preventDefault();
			ev.stopPropagation();
			drawer.toggle();
		} );
	}
}( mw.mobileFrontend, jQuery ) );
