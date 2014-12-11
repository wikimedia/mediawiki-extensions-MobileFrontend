( function ( $, M ) {
	var schema = M.require( 'loggingSchemas/MobileWebClickTracking' );

	// EventLogging events
	// Clicking through to article
	schema.hijackLink( 'Diff', 'h2 a', 'view' );

	// Clicking previous or next diff links
	schema.hijackLink( 'Diff', '.revision-history-links a', 'diff-prev-or-next' );

	// user link
	schema.hijackLink( 'Diff', '.mw-mf-user a', 'user' );

	// thank button
	schema.hijackLink( 'Diff', '#mw-mf-userinfo > button', 'thank' );

} )( jQuery, mw.mobileFrontend );
