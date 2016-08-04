( function ( M, $ ) {
	var MainMenu = M.require( 'mobile.mainMenu/MainMenu' ),
		mainMenu = createMainMenu();

	/**
	 * Creates an instance of the `MainMenu`, using the `wgMinervaMenuData` for configuration.
	 *
	 * N.B. that the activator - the UI element that the user must click in order to open the main
	 * menu - is always `.header .main-menu-button`.
	 *
	 * @return {MainMenu}
	 *
	 * @ignore
	 */
	function createMainMenu() {
		var options = mw.config.get( 'wgMinervaMenuData' );

		// [T117970] Since `wgMinervaMenuData` is added to the page on the server, rather than via the
		// `ResourceLoaderGetConfigVars` hook, it may be stale, whereas the template that it's passed to
		// won't be.
		//
		// FIXME: Remove this shim when the cache clears.
		if ( !options.groups ) {
			options.groups = [
				options.discovery,
				options.personal
			];

			delete options.discovery;
			delete options.personal;
		}

		options.activator = '.header .main-menu-button';

		return new MainMenu( options );
	}

	$( function () {
		if ( !$( '#mw-mf-page-left' ).find( '.menu' ).length ) {
			// Now we have a main menu button register it.
			mainMenu.registerClickEvents();
			mainMenu.appendTo( '#mw-mf-page-left' );
		}
	} );

	M.define( 'skins.minerva.scripts.top/mainMenu', mainMenu )
		// Used by Gather
		.deprecate( 'skins.minerva.scripts/mainMenu' );
}( mw.mobileFrontend, jQuery ) );
