( function ( M, $ ) {
	M.require( 'context' ).assertMode( [ 'alpha' ] );
	var $wikiGrokMenuItem =  $( '#mw-mf-page-left' ).find( '.wikigrok-roulette' ),
		wikiGrokRoulette = M.require( 'modules/wikiGrokRoulette/wikiGrokRoulette' );

	// Handle Random WikiGrok menu item
	if ( $wikiGrokMenuItem.length ) {
		$wikiGrokMenuItem.one( 'click', function ( ev ) {
			ev.preventDefault();
			wikiGrokRoulette.navigateToNextPage();
		} );
	}
}( mw.mobileFrontend, jQuery ) );
