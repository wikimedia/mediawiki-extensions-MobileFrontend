// Determine whether or not it is appropriate to load WikiGrok, and if so, load it.
( function( M, $ ) {
	var wikidataID = mw.config.get( 'wgWikibaseItemId' ),
		idOverride;

	// Allow query string override for testing, for example, '?wikidataid=Q508703'
	if ( !wikidataID ) {
		idOverride = window.location.search.match( /wikidataid=([^&]*)/ );
		if ( idOverride ) {
			mw.config.set( 'wgWikibaseItemId', idOverride[1] );
			wikidataID = idOverride[1];
			// Reset opt out
			localStorage.removeItem( 'mfHideWikiGrok' );
		}
	}

	// Only run in alpha mode
	M.assertMode( [ 'beta', 'alpha' ] );

	if (
		// WikiGrok is enabled
		mw.config.get( 'wgMFEnableWikiGrok' ) &&
		// User is logged in
		!mw.user.isAnon() &&
		// We're not on the Main Page
		!mw.config.get( 'wgIsMainPage' ) &&
		// We're not on a tablet
		!M.isWideScreen() &&
		// We're in 'view' mode
		mw.config.get( 'wgAction' ) === 'view' &&
		// Wikibase is active and this page has an item ID
		wikidataID &&
		// We're in Main namespace,
		mw.config.get( 'wgNamespaceNumber' ) === 0 &&
		// The user has not opted out of WikiGrok previously
		M.supportsLocalStorage &&
		!localStorage.getItem( 'mfHideWikiGrok' )
	) {
		mw.loader.load( 'mobile.wikigrok.dialog' );

		// Make OverlayManager handle '#/wikigrok/about' links.
		M.overlayManager.add( /^\/wikigrok\/about$/, function() {
			var d = $.Deferred();
			mw.loader.using( 'mobile.wikigrok.dialog' ).done( function() {
				var WikiGrokMoreInfo = M.require( 'modules/wikigrok/WikiGrokMoreInfo' );
				d.resolve( new WikiGrokMoreInfo() );
			} );
			return d;
		} );
	}
}( mw.mobileFrontend, jQuery ) );
