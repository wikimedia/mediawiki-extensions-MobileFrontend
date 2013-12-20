( function ( $ ) {
	// Redirect users with javascript to the proper editor
	location.replace( $( '#mw-mf-editor' ).data( 'targeturl' ) );
} )( jQuery );
