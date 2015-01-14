( function ( M, $ ) {
	var MainMenu = M.require( 'MainMenu' );

	M.on( 'header-loaded', function () {
		// Render MainMenu when needed
		$( '#mw-mf-main-menu-button' ).on( 'click', function ( ev ) {
			ev.preventDefault();
			M.mainMenu = new MainMenu();
			M.mainMenu.openNavigationDrawer( '' );
		} );
	} );
}( mw.mobileFrontend, jQuery ) );
