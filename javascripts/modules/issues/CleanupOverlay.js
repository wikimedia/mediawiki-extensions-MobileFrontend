( function( M ) {
	var Overlay = M.require( 'Overlay' ),
	CleanupOverlay = Overlay.extend( {
		templatePartials: {
			content: M.template.get( 'overlays/cleanup.hogan' )
		},
		initialize: function( options ) {
			options.heading = '<strong>' + options.headingText + '</strong>';
			Overlay.prototype.initialize.call( this, options );
		}
	} );
	M.define( 'modules/issues/CleanupOverlay', CleanupOverlay );
}( mw.mobileFrontend ) );
