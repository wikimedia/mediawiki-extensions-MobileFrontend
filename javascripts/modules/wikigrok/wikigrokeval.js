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
			function( data ) {
				var instanceClaims,
					loadWikiGrokDialog = false;

				// See if the page has any 'instance of' claims.
				if ( data.entities !== undefined && data.entities[wikidataID].claims.P31 !== undefined ) {
					instanceClaims = data.entities[wikidataID].claims.P31;
					$.each( instanceClaims, function( id, claim ) {
						// See if any of the claims state that the topic is a human.
						if ( claim.mainsnak.datavalue.value['numeric-id'] === 5 ) {
							// Make sure there are no existing occupation claims.
							if ( data.entities[wikidataID].claims.P106 === undefined ) {
								loadWikiGrokDialog = true;
							}
							// Break each loop.
							return false;
						}
					} );
					if ( loadWikiGrokDialog ) {
						new WikiGrokDialog( { itemId: wikidataID } );
					}
				}
			}
		);
	}

}( mw.mobileFrontend, jQuery ) );
