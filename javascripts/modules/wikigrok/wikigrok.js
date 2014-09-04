// Determine whether or not it is appropriate to load WikiGrok, and if so, load it.
( function( M ) {
	var wikidataID = mw.config.get( 'wgWikibaseItemId' );
	//var wikidataID = 'Q508703';

	// Only run in alpha mode
	M.assertMode( [ 'alpha' ] );

	// Only load if WikiGrok is enabled, Wikibase is active, we're not on the Main Page,
	// we're in Main namespace, the browser supports localStorage, and the user has not
	// opted out of WikiGrok previously.
	if ( mw.config.get( 'wgMFEnableWikiGrok' ) &&
		!mw.config.get( 'wgIsMainPage' ) &&
		wikidataID &&
		mw.config.get( 'wgNamespaceNumber' ) === 0 &&
		M.supportsLocalStorage &&
		!localStorage.getItem( 'mfHideWikiGrok' )
	) {
		mw.loader.load( 'mobile.wikigrok' );
	}
}( mw.mobileFrontend ) );
