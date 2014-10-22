( function( M ) {
	var Overlay = M.require( 'Overlay' ),
	/**
	 * @class CleanupOverlay
	 * @extends Overlay
	 */
	CleanupOverlay = Overlay.extend( {
		templatePartials: {
			content: M.template.get( 'modules/issues/cleanup.hogan' )
		},
		initialize: function( options ) {
			options.heading = '<strong>' + options.headingText + '</strong>';
			Overlay.prototype.initialize.call( this, options );
		}
	} );
	M.define( 'modules/issues/CleanupOverlay', CleanupOverlay );
}( mw.mobileFrontend ) );
