( function( M ) {
	var Overlay = M.require( 'Overlay' ),
	CleanupOverlay = Overlay.extend( {
		templatePartials: {
			content: M.template.get( 'overlays/cleanup.hogan' )
		},
		initialize: function( options ) {
			options.heading = '<strong>' + options.headingText + '</strong>';
			this._super( options );
		}
	} );
	M.define( 'modules/issues/CleanupOverlay', CleanupOverlay );
}( mw.mobileFrontend ) );
