( function ( M, $ ) {
	M.require( 'context' ).assertMode( [ 'alpha' ] );
	var browser = M.require( 'browser' ),
		mainMenu = M.require( 'skin' ).mainMenu,
		$wikiGrokMenuItem =  $( '#mw-mf-page-left' ).find( '.wikigrok-roulette' ),
		wikiGrokRoulette = M.require( 'modules/wikiGrokRoulette/wikiGrokRoulette' ),
		InfoOverlay = M.require( 'modules/wikiGrokRoulette/InfoOverlay' );

	// Handle Random WikiGrok menu item
	if ( $wikiGrokMenuItem.length ) {
		$wikiGrokMenuItem.on( 'click', function ( ev ) {
			ev.preventDefault();
			// Show the tutorial once
			if ( browser.supportsLocalStorage ) {
				if ( localStorage.getItem( 'hasWikiGrokRouletteInfoBeenShown' ) === '1' ) {
					wikiGrokRoulette.navigateToNextPage();
				} else {
					mainMenu.closeNavigationDrawers();
					new InfoOverlay().show();
				}
			} else {
				wikiGrokRoulette.navigateToNextPage();
			}
		} );
	}
}( mw.mobileFrontend, jQuery ) );
