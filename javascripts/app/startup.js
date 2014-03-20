( function( M, $ ) {
	var mainPage = mw.config.get( 'wgMainPageTitle' );

	$( function() {
		if ( M.history.navigateToPage ) {
			// lazy load main page
			M.history.navigateToPage( mainPage );
		} else {
			// FIXME: Show app unavailable error
		}
	} );

}( mw.mobileFrontend, jQuery ) );
