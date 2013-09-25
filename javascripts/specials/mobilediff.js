( function( $, M ) {
	var schema = M.require( 'loggingSchemas/MobileWebClickTracking' );

	// EventLogging events
	// Clicking through to article
	schema.hijackLink( 'h2 a', 'diff-view' );

	// Clicking previous or next diff links
	schema.hijackLink( '.revision-history-links a', 'diff-prev-or-next' );

	// user link
	schema.hijackLink( '.mw-mf-user a', 'diff-user' );

} )( jQuery, mw.mobileFrontend );
