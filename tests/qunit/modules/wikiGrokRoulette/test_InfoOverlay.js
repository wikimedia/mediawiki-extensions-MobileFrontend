( function ( $, M ) {
	var InfoOverlay = M.require( 'modules/wikiGrokRoulette/InfoOverlay' ),
		wikiGrokRoulette = M.require( 'modules/wikiGrokRoulette/wikiGrokRoulette' );

	QUnit.module( 'MobileFrontend: WikiGrokRoulette', {
		setup: function () {
			this.stub( wikiGrokRoulette, 'getNextPage' );
			this.stub( wikiGrokRoulette, 'navigateToNextPage' );
			this.infoOverlay = new InfoOverlay();
			localStorage.removeItem( 'hasWikiGrokRouletteInfoBeenShown' );
		}
	} );

	QUnit.test( '#Clicking "Let\'s Go" is stored in the localStorage', 1, function ( assert ) {
		this.infoOverlay.$el.find( '.lets-go' ).click();
		assert.equal(
			localStorage.getItem( 'hasWikiGrokRouletteInfoBeenShown' ),
			'1',
			'Let\'s go has been clicked'
		);
	} );
}( jQuery, mw.mobileFrontend ) );
