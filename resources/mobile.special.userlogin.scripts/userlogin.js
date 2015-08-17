( function ( M, $ ) {
	// Most people on mobile devices are on a personal device so this property should be assumed.
	// To be consistent across platforms do same on desktop
	$( function () {
		$( '#wpRemember' ).prop( 'checked', true );
	} );

} )( mw.mobileFrontend, jQuery );
