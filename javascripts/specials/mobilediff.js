( function ( $, M ) {
	var SchemaMobileWebClickTracking = M.require( 'loggingSchemas/SchemaMobileWebClickTracking' ),
		diffSchema = new SchemaMobileWebClickTracking( {}, 'MobileWebDiffClickTracking' );

	// EventLogging events
	// Clicking through to article
	diffSchema.hijackLink( 'h2 a', 'view' );

	// Clicking previous or next diff links
	diffSchema.hijackLink( '.revision-history-links a', 'prev-or-next' );

	// user link
	diffSchema.hijackLink( '.mw-mf-user a', 'user' );

	// thank button is already logged tracked in the Thank extension
	// If you update the schema related code, remember to update the Thank extension too

} )( jQuery, mw.mobileFrontend );
