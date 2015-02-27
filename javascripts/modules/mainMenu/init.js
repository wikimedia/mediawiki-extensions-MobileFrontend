( function ( M, $ ) {
	var MainMenu = M.require( 'MainMenu' ),
		mainMenu = new MainMenu(),
		isBeta = M.require( 'context' ).isBetaGroupMember();

	M.on( 'header-loaded', function () {
		// Render MainMenu when needed
		$( '#mw-mf-main-menu-button' ).on( 'click', function ( ev ) {
			ev.preventDefault();
			mainMenu = new MainMenu();
			mainMenu.openNavigationDrawer();
		} );

		// "The back icon takes the user back to the previous page they were on.". See
		// https://trello.com/c/Isf8stWH/1-5-new-mobile-menu-page.
		if ( isBeta ) {
			$( '.header .back' ).on( 'click', function ( ev ) {
				ev.preventDefault();

				window.history.back();
			} );
		}
	} );

}( mw.mobileFrontend, jQuery ) );
