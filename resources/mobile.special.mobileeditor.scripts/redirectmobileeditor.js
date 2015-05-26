( function ( $ ) {
	// Redirect users with javascript to the proper editor
	var redirectTarget = $( '#mw-mf-editor' ).data( 'targeturl' );
	if ( redirectTarget !== undefined ) {
		location.replace( redirectTarget );
	} else {
		location.replace( 'index.php?title=' + mw.config.get( 'wgMainPageTitle' ) );
	}
} )( jQuery );
