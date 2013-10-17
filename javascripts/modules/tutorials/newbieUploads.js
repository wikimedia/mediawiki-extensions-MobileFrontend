( function( M, $ ) {
	var LeadPhotoTutorialOverlay = M.require( 'modules/tutorials/LeadPhotoTutorialOverlay' ),
		shouldShowUploadTutorial = $( '#ca-upload' ).hasClass( 'enabled' ) && M.query.article_action === 'photo-upload',
		photoOverlay;

	if ( M.isLoggedIn() && shouldShowUploadTutorial ) {
		photoOverlay = new LeadPhotoTutorialOverlay( {
			target: $( '#ca-upload input' ),
			funnel: 'newbie'
		} );
		photoOverlay.show();
		$( '#ca-upload' ).on( 'mousedown', $.proxy( photoOverlay, 'hide' ) );
	}

}( mw.mobileFrontend, jQuery ) );
