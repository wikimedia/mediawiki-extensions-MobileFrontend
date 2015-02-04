( function ( M, $ ) {
	var MainMenu = M.require( 'MainMenu' ),
		mainMenu = new MainMenu();

	M.on( 'header-loaded', function () {
		// Render MainMenu when needed
		$( '#mw-mf-main-menu-button' ).on( 'click', function ( ev ) {
			ev.preventDefault();
			mainMenu = new MainMenu();
			mainMenu.openNavigationDrawer();
		} );
	} );
}( mw.mobileFrontend, jQuery ) );
