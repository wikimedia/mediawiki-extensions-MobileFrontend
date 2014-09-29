( function( M, $ ) {
	var wikidataID = mw.config.get( 'wgWikibaseItemId' ),
		WikiGrokApi = M.require( 'modules/wikigrok/WikiGrokApi' ),
		WikiGrokDialog = M.require( 'modules/wikigrok/WikiGrokDialog' ),
		apiWikiGrok;

	// See if there are potential occupation claims about this person so we can decide if
	// it's appropriate to display the WikiGrok interface.
	if ( !M.settings.getUserSetting( 'mfHideWikiGrok' ) ) {
		apiWikiGrok = new WikiGrokApi( { itemId: wikidataID } );
		// FIXME: This fires an API request on every page load. We may need to do
		// something different if this is promoted to stable.
		apiWikiGrok.getPossibleOccupations().done( function( occupations ) {
			var dialog;
			if ( occupations.length ) {
				dialog = new WikiGrokDialog( { itemId: wikidataID, occupations: occupations } );
				if ( $( '.toc-mobile' ).length ) {
					dialog.insertBefore( '.toc-mobile' );
				} else {
					dialog.appendTo( M.getLeadSection() );
				}
			}
		} );
	}

}( mw.mobileFrontend, jQuery ) );
