( function ( M, $ ) {
	var Overlay = M.require( 'mobile.overlays/Overlay' ),
		Icon = M.require( 'mobile.startup/Icon' ),
		icon = new Icon( {
			name: 'cleanup-gray',
			additionalClassNames: 'issue-notice',
			hasText: true
		} );

	/**
	 * Overlay for displaying page issues
	 * @class CleanupOverlay
	 * @extends Overlay
	 */
	function CleanupOverlay( options ) {
		options.heading = '<strong>' + options.headingText + '</strong>';
		Overlay.call( this, options );
	}

	OO.mfExtend( CleanupOverlay, Overlay, {
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
		} )
	} );
	M.define( 'mobile.issues/CleanupOverlay', CleanupOverlay );
}( mw.mobileFrontend, jQuery ) );
