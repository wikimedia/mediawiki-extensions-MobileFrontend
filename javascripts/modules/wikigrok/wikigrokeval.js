( function( M, $ ) {
	var wikidataID = mw.config.get( 'wgWikibaseItemId' ),
		WikiGrokDialog = M.require( 'modules/wikigrok/WikiGrokDialog' );

	// Get existing Wikidata claims about this page so we can decide if it's appropriate
	// to display the WikiGrok interface.
	$.ajax( {
		type: 'get',
		url: 'https://www.wikidata.org/w/api.php',
		data: {
			'action': 'wbgetentities',
			'ids': wikidataID,
			'props': 'claims',
			'format': 'json'
		},
		// Using JSONP so we aren't restricted by cross-site rules. This isn't
		// strictly needed on the Wikimedia cluster since it has CORS exceptions
		// for requests from other Wikimedia sites, but this makes it easy to
		// test locally.
		dataType: 'jsonp',
		success: function( data ) {
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
	} );

}( mw.mobileFrontend, jQuery ) );
