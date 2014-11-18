( function ( M ) {
	var Overlay = M.require( 'Overlay' ),
		Icon = M.require( 'Icon' ),
		icon = new Icon( { name: 'cleanup-gray', additionalClassNames: 'issue-notice', hasText: true } ),
		CleanupOverlay;

	/**
	 * Overlay for displaying page issues
	 * @class CleanupOverlay
	 * @extends Overlay
	 */
	CleanupOverlay = Overlay.extend( {
		templatePartials: {
			content: mw.template.get( 'mobile.issues', 'OverlayContent.hogan' )
		},
		defaults: {
			className: icon.getClassName()
		},
		initialize: function ( options ) {
			options.heading = '<strong>' + options.headingText + '</strong>';
			Overlay.prototype.initialize.call( this, options );
		}
	} );
	M.define( 'modules/issues/CleanupOverlay', CleanupOverlay );
}( mw.mobileFrontend ) );
