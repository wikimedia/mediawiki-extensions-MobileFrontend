( function ( M ) {
	M.assertMode( [ 'alpha' ] );
	var infobox,
		page = M.getCurrentPage(),
		wikidataID = mw.config.get( 'wgWikibaseItemId' ),
		Infobox = M.require( 'modules/wikigrok/Infobox' );

	// Load infoboxes on pages in the main space which are not main pages
	if ( wikidataID && !page.isMainPage() && page.getNamespaceId() === 0 ) {
		// build the future
		infobox = new Infobox( {
			itemId: wikidataID
		} );
		infobox.insertBefore( '#content' );
	}
}( mw.mobileFrontend ) );
