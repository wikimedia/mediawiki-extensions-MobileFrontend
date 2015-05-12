( function ( M, $ ) {
	var MainMenu = M.require( 'MainMenu' ),
		mainMenu = new MainMenu();

	M.on( 'header-loaded', function () {
		// Render MainMenu when needed
		// In alpha there is no #mw-mf-main-menu-button, the user can click on the header
		// search icon or the site name in the header to open the main menu
		$( '#mw-mf-main-menu-button, .alpha .header a.header-icon, .alpha .header .header-title a' )
			.on( 'click', function ( ev ) {
				mainMenu.openNavigationDrawer();
				ev.preventDefault();
				// Stop propagation, otherwise the Skin will close the open menus on page center click
				ev.stopPropagation();
			} );
	} );

	$( function () {
		if ( !$( '#mw-mf-page-left' ).find( '.menu' ).length ) {
			mainMenu.appendTo( '#mw-mf-page-left' );
		}
	} );

}( mw.mobileFrontend, jQuery ) );
