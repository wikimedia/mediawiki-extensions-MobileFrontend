( function ( M, $ ) {
	var
		MainMenu = M.require( 'mobile.mainMenu/MainMenu' ),
		mainMenu = new MainMenu( {
			activator: '.header .main-menu-button'
		} );

	// bind events
	M.define( 'mobile.head/mainMenu', mainMenu );
	M.on( 'header-loaded', function () {
		// Now we have a main menu button register it.
		mainMenu.registerClickEvents();
	} );

	$( function () {
		if ( !$( '#mw-mf-page-left' ).find( '.menu' ).length ) {
			mainMenu.appendTo( '#mw-mf-page-left' );
		}
	} );

}( mw.mobileFrontend, jQuery ) );
