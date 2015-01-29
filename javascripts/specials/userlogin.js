( function ( M, $ ) {
	var browser = M.require( 'browser' );

	if ( !browser.isWideScreen() ) {
		// Most people on mobile devices are on a personal device so this property should be assumed.
		$( function () {
			$( '#wpRemember' ).prop( 'checked', true );
		} );
	}

} )( mw.mobileFrontend, jQuery );
