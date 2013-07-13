( function( M, $ ) {
	var PageActionOverlay = M.require( 'tutorials/PageActionOverlay' );

	function shouldShowUploadTutorial() {
		// FIXME: Limit audience to only users with low edit count
		return $( '#ca-upload' ).hasClass( 'enabled' ) &&
			window.location.search.indexOf( 'article_action=photo-upload' ) > -1;
	}

	$( function() {
		var photoOverlay;

		if ( shouldShowUploadTutorial() ) {
			photoOverlay = new PageActionOverlay( {
				target: $( '#ca-upload' )
			} );
			photoOverlay.show();
			$( '#ca-upload' ).on( 'mousedown', $.proxy( photoOverlay, 'hide' ) );
		}
	} );

}( mw.mobileFrontend, jQuery ) );
