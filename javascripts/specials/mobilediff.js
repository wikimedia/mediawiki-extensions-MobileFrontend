( function ( $, M ) {
	var schema = M.require( 'loggingSchemas/MobileWebClickTracking' );

	// EventLogging events
	// Clicking through to article
	schema.hijackLink( 'Diff', 'h2 a', 'view' );

	// Clicking previous or next diff links
	schema.hijackLink( 'Diff', '.revision-history-links a', 'prev-or-next' );

	// user link
	schema.hijackLink( 'Diff', '.mw-mf-user a', 'user' );

	// thank button is already logged tracked in the Thank extension
	// If you update the schema related code, remember to update the Thank extension too

} )( jQuery, mw.mobileFrontend );
