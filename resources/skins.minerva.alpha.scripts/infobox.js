( function ( M ) {
	M.require( 'context' ).assertMode( [ 'alpha' ] );
	var infobox,
		page = M.getCurrentPage(),
		wikidataID = M.require( 'util' ).getWikiBaseItemId(),
		overlayManager = M.require( 'overlayManager' ),
		InfoboxEditorOverlay = M.require( 'modules/InfoboxEditorOverlay' ),
		Infobox = M.require( 'modules/Infobox' );

	// Load infoboxes on pages in the main space which are not main pages
	if ( wikidataID && !page.isMainPage() && page.getNamespaceId() === 0 ) {
		// build the future
		infobox = new Infobox( {
			itemId: wikidataID
		} );
		infobox.insertAfter( '.pre-content' );

		overlayManager.add( /\/infobox\/editor/, function () {
			return new InfoboxEditorOverlay( {
				infobox: infobox
			} );
		} );
	}
}( mw.mobileFrontend ) );
