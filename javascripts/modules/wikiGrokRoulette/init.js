( function ( M, $ ) {
	M.assertMode( [ 'alpha' ] );
	var $wikiGrokMenuItem =  $( '#mw-mf-page-left' ).find( '.wikigrok-roulette' ),
		mainMenu = M.require( 'mainmenu' ),
		LoadingOverlay = M.require( 'LoadingOverlay' ),
		ErrorDrawer = M.require( 'modules/wikiGrokRoulette/ErrorDrawer' );

	// Handle Random WikiGrok menu item
	if ( $wikiGrokMenuItem.length ) {
		$wikiGrokMenuItem.on( 'click', function ( ev ) {
			var api = M.require( 'api' ),
				query = M.query,
				loadingOverlay = new LoadingOverlay();

			ev.preventDefault();

			loadingOverlay.show();

			api.ajax( {
				action: 'query',
				list: 'wikigrokrandom',
				categories: this.categories
			} ).done( function ( response ) {
				if ( response.query &&
					response.query.wikigrokrandom &&
					response.query.wikigrokrandom.length > 0
				) {
					// Remove title from query because it's already used in constructing the URL.
					// Leave everything else unchanged for testing purposes.
					delete query.title;
					// navigated to the random page
					window.location.href = mw.util.getUrl(
						response.query.wikigrokrandom[0].title,
						query
					) + '#wikigrokversion=c';
					// FIXME: expose wikigrok/init.js so that we can just show wikigrok without reloading in such cases
					// force reload if page titles match
					if ( M.getCurrentPage().title === response.query.wikigrokrandom[0].title ) {
						window.location.reload();
					}
				} else {
					loadingOverlay.hide( false );
					new ErrorDrawer();
				}
			} ).fail( function () {
				loadingOverlay.hide( false );
				new ErrorDrawer();
			} ).always( function () {
				mainMenu.closeNavigationDrawers();
			} );
		} );
	}
}( mw.mobileFrontend, jQuery ) );
