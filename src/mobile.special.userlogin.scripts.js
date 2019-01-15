/* global $ */
$( function () {
	// Most people on mobile devices are on a personal device so this property should be assumed.
	// To be consistent across platforms do same on desktop
	$( '#wpRemember' ).prop( 'checked', true );
} );
