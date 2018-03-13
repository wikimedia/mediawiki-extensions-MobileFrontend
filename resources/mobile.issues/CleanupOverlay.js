( function ( M ) {
	var Overlay = M.require( 'mobile.startup/Overlay' ),
		util = M.require( 'mobile.startup/util' ),
		Icon = M.require( 'mobile.startup/Icon' ),
		icon = new Icon( {
			name: 'cleanup-gray'
		} );

	/**
	 * Overlay for displaying page issues
	 * @class CleanupOverlay
	 * @extends Overlay
	 *
	 * @constructor
	 * @param {Object} options Configuration options
	 * @param {string} options.headingText
	 */
	function CleanupOverlay( options ) {
		options.heading = '<strong>' + options.headingText + '</strong>';
		Overlay.call( this, options );
	}

	OO.mfExtend( CleanupOverlay, Overlay, {
		className: 'overlay overlay-cleanup',
		templatePartials: util.extend( {}, Overlay.prototype.templatePartials, {
			content: mw.template.get( 'mobile.issues', 'OverlayContent.hogan' )
		} ),
		preRender: function () {
			this.options.issues = this.options.issues.map( function ( issue ) {
				// If an icon is not defined, then add the default icon
				return issue.icon ? issue : util.extend( {}, issue, {
					icon: icon.toHtmlString()
				} );
			} );
		}
	} );
	M.define( 'mobile.issues/CleanupOverlay', CleanupOverlay ); // resource-modules-disable-line
}( mw.mobileFrontend ) );
