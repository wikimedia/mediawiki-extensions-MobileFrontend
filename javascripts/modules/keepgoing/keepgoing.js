// If we are loading a page from the server, and we are in a mobile-keepgoing campaign,
// load the KeepGoing interface set to step 2 (explaining).
( function( M ) {
	if ( mw.config.get( 'wgMFKeepGoing' ) &&
		M.query.campaign === 'mobile-keepgoing' &&
		mw.config.get( 'wgNamespaceNumber' ) > -1
	) {
		mw.loader.using( 'mobile.keepgoing', function() {
			var KeepGoingOverlay = M.require( 'modules/keepgoing/KeepGoingOverlay' );
			new KeepGoingOverlay( { step: 2 } );
		} );
	}
}( mw.mobileFrontend ) );
