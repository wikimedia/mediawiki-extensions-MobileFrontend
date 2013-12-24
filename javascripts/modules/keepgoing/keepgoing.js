// If we are loading a page from the server, and we are in a mobile-keepgoing campaign,
// load the KeepGoing interface set to step 2 (explaining).
( function( M ) {
	var user = M.require( 'user' ),
		campaign = M.query.campaign,
		inKeepGoingCampaign = campaign === 'mobile-keepgoing',
		inMainPageCampaign = campaign === 'mobile-mainpage-keepgoing-links';

	if ( mw.config.get( 'wgMFKeepGoing' ) &&
		( inKeepGoingCampaign || inMainPageCampaign ) &&
		mw.config.get( 'wgNamespaceNumber' ) > -1
	) {
		mw.loader.using( 'mobile.keepgoing', function() {
			var KeepGoingOverlay = M.require( 'modules/keepgoing/KeepGoingOverlay' );
			// Only show KeepGoing campaign to users who are on their 1st edit
			if ( user.getEditCount() === 1 || inMainPageCampaign ) {
				new KeepGoingOverlay( { step: 2, campaign: campaign } ).show();
			}
		} );
	}
}( mw.mobileFrontend ) );
