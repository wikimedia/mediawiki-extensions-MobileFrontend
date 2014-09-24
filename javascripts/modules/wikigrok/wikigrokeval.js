( function( M, $ ) {
	var api,
		wikidataID = mw.config.get( 'wgWikibaseItemId' ),
		WikiDataApi = M.require( 'modules/wikigrok/WikiDataApi' ),
		WikiGrokDialog = M.require( 'modules/wikigrok/WikiGrokDialog' );

	// Get existing Wikidata claims about this page so we can decide if it's appropriate
	// to display the WikiGrok interface.
	if ( !M.settings.getUserSetting( 'mfHideWikiGrok' ) ) {
		api = new WikiDataApi( { itemId: wikidataID });
		api.getClaims().done(
			function( claims ) {
				var dialog;

				if ( claims && !claims.hasOccupation ) {
					dialog = new WikiGrokDialog( { itemId: wikidataID } );
					// If there is a table of contents, insert before it.
					if ( $( '.toc-mobile' ).length ) {
						dialog.insertBefore( '.toc-mobile' );
					} else {
						dialog.appendTo( M.getLeadSection() );
					}
				}
			}
		);
	}

}( mw.mobileFrontend, jQuery ) );
