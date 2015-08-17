( function ( M, $ ) {
	var Overlay = M.require( 'mobile.overlays/Overlay' ),
		Icon = M.require( 'mobile.startup/Icon' ),
		icon = new Icon( {
			name: 'cleanup-gray',
			additionalClassNames: 'issue-notice',
			hasText: true
		} ),
		CleanupOverlay;

	/**
	 * Overlay for displaying page issues
	 * @class CleanupOverlay
	 * @extends Overlay
	 */
	CleanupOverlay = Overlay.extend( {
		templatePartials: $.extend( {}, Overlay.prototype.templatePartials, {
			content: mw.template.get( 'mobile.issues', 'OverlayContent.hogan' )
		} ),
		/**
		 * @inheritdoc
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {String} defaults.className Class name of the 'cleanup-gray' icon.
		 */
		defaults: $.extend( {}, Overlay.prototype.defaults, {
			className: icon.getClassName()
		} ),
		/** @inheritdoc */
		initialize: function ( options ) {
			options.heading = '<strong>' + options.headingText + '</strong>';
			Overlay.prototype.initialize.call( this, options );
		}
	} );
	M.define( 'mobile.issues/CleanupOverlay', CleanupOverlay );
}( mw.mobileFrontend, jQuery ) );
