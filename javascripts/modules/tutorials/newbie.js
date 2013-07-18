( function( M, $ ) {
	var LeadPhotoTutorialOverlay = M.require( 'tutorials/LeadPhotoTutorialOverlay' );

	function shouldShowUploadTutorial() {
		// FIXME: Limit audience to only users with low edit count
		return $( '#ca-upload' ).hasClass( 'enabled' ) &&
			window.location.search.indexOf( 'article_action=photo-upload' ) > -1;
	}

	$( function() {
		var photoOverlay;

		if ( shouldShowUploadTutorial() ) {
			photoOverlay = new LeadPhotoTutorialOverlay( {
				target: $( '#ca-upload' ),
				funnel: 'newbie'
			} );
			photoOverlay.show();
			$( '#ca-upload' ).on( 'mousedown', $.proxy( photoOverlay, 'hide' ) );
		}
	} );

}( mw.mobileFrontend, jQuery ) );
