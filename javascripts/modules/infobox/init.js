( function ( M, $ ) {
	M.assertMode( [ 'alpha' ] );
	var infobox,
		wikidataID = mw.config.get( 'wgWikibaseItemId' ),
		Infobox = M.require( 'modules/wikigrok/Infobox' );

	if ( wikidataID ) {
		// upset people
		$( '.infobox' ).hide();
		// build the future
		infobox = new Infobox( {
			itemId: wikidataID
		} );
		infobox.insertBefore( '#content' );
	}
}( mw.mobileFrontend, jQuery ) );
