( function( M, $ ) {
	var wikidataID = mw.config.get( 'wgWikibaseItemId' ),
		WikiGrokApi = M.require( 'modules/wikigrok/WikiGrokApi' ),
		WikiGrokDialog = M.require( 'modules/wikigrok/WikiGrokDialog' ),
		apiWikiGrok;

	// See if there are potential occupation claims about this person so we can decide if
	// it's appropriate to display the WikiGrok interface.
	function init() {
		apiWikiGrok = new WikiGrokApi( { itemId: wikidataID } );
		// FIXME: This fires an API request on every page load. We may need to do
		// something different if this is promoted to stable.
		apiWikiGrok.getPossibleOccupations().done( function( occupations ) {
			var dialog;
			if ( occupations.length ) {
				dialog = new WikiGrokDialog( { itemId: wikidataID,
					title: mw.config.get( 'wgTitle' ),
					occupations: occupations } );
				if ( $( '.toc-mobile' ).length ) {
					dialog.insertBefore( '.toc-mobile' );
				} else {
					dialog.appendTo( M.getLeadSection() );
				}
			}
		} );
	}

	if ( !M.settings.getUserSetting( 'mfHideWikiGrok' ) ) {
		if ( M.isAlphaGroupMember() ) {
			mw.loader.using( 'mobile.wikigrok.dialog.b' ).done( function() {
				WikiGrokDialog = M.require( 'modules/wikigrok/WikiGrokDialogB' );
				init();
			} );
		} else {
			init();
		}
	}

}( mw.mobileFrontend, jQuery ) );
