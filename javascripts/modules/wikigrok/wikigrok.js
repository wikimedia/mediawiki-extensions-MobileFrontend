// Determine whether or not it is appropriate to load WikiGrok, and if so, load it.
( function( M, $ ) {
	var wikidataID = mw.config.get( 'wgWikibaseItemId' ),
		permittedOnThisDevice = mw.config.get( 'wgMFEnableWikiGrokOnAllDevices' ) || !M.isWideScreen(),
		useDialogB = M.isAlphaGroupMember(),
		rlModuleName = useDialogB ? 'mobile.wikigrok.dialog.b' : 'mobile.wikigrok.dialog',
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
		// Permitted on this device
		permittedOnThisDevice &&
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
		mw.loader.using( rlModuleName ).done( function() {
			var WikiGrokApi = M.require( 'modules/wikigrok/WikiGrokApi' ),
				moduleName = useDialogB ? 'modules/wikigrok/WikiGrokDialogB' :
					'modules/wikigrok/WikiGrokDialog',
				WikiGrokDialog = M.require( moduleName ),
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
				init();
			}
		} );

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
