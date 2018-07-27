( function ( M ) {
	var Overlay = M.require( 'mobile.startup/Overlay' ),
		util = M.require( 'mobile.startup/util' );

	/**
	 * Overlay for displaying page issues
	 * @class CleanupOverlay
	 * @extends Overlay
	 *
	 * @param {Object} options Configuration options
	 * @param {string} options.headingText
	 */
	function CleanupOverlay( options ) {
		options.heading = '<strong>' + options.headingText + '</strong>';
		Overlay.call( this, options );
	}

	OO.mfExtend( CleanupOverlay, Overlay, {
		/**
		 * @memberof CleanupOverlay
		 * @instance
		 */
		className: 'overlay overlay-cleanup',
		/**
		 * @memberof CleanupOverlay
		 * @instance
		 */
		templatePartials: util.extend( {}, Overlay.prototype.templatePartials, {
			content: mw.template.get( 'mobile.issues', 'OverlayContent.hogan' )
		} )
	} );
	M.define( 'mobile.issues/CleanupOverlay', CleanupOverlay ); // resource-modules-disable-line
}( mw.mobileFrontend ) );
