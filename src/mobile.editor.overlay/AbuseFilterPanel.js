var util = require( '../mobile.startup/util' ),
	View = require( '../mobile.startup/View' ),
	mfExtend = require( '../mobile.startup/mfExtend' ),
	AbuseFilterOverlay = require( './AbuseFilterOverlay' );

/**
 * Panel that shows an error message related to the abusefilter extension.
 * @class AbuseFilterPanel
 * @extends View
 * @uses AbuseFilterOverlay
 *
 * @param {Object} options Configuration options
 * FIXME: should extend Panel not View. Or the name should be changed to something meaningful.
 */
function AbuseFilterPanel( options ) {
	this.isDisallowed = false;
	this.overlayManager = options.overlayManager;
	View.call( this,
		util.extend( {
			className: 'panel hidden'
		}, options )
	);
}

mfExtend( AbuseFilterPanel, View, {
	/**
	 * @memberof AbuseFilterPanel
	 * @instance
	 * @mixes View#defaults
	 * @property {Object} defaults Default options hash.
	 * @property {string} defaults.readMoreMsg A caption for the button
	 * allowing the user to read more about the problems with their edit.
	 * @property {OverlayManager} defaults.overlayManager instance
	 */
	defaults: {
		readMoreMsg: mw.msg( 'mobile-frontend-editor-abusefilter-read-more' )
	},
	/**
	 * @memberof AbuseFilterPanel
	 * @instance
	 */
	template: mw.template.get( 'mobile.editor.overlay', 'AbuseFilterPanel.hogan' ),
	/**
	 * Show the panel. Create a route to show AbuseFilterOverlay with message.
	 * @memberof AbuseFilterPanel
	 * @instance
	 * @param {string} type The type of alert, e.g. 'warning' or 'disallow'
	 * @param {string} message Message to show in the AbuseFilter overlay
	 */
	show: function ( type, message ) {
		var msg;

		// OverlayManager will replace previous instance of the route if present
		this.overlayManager.add( /^\/abusefilter$/, function () {
			return new AbuseFilterOverlay( {
				message: message
			} );
		} );

		if ( type === 'warning' ) {
			msg = mw.msg( 'mobile-frontend-editor-abusefilter-warning' );
		} else if ( type === 'disallow' ) {
			msg = mw.msg( 'mobile-frontend-editor-abusefilter-disallow' );
			this.isDisallowed = true;
		}

		this.$el.find( '.message p' ).text( msg );
		this.$el.removeClass( 'hidden' );
	},

	/**
	 * Hide the panel.
	 * @memberof AbuseFilterPanel
	 * @instance
	 */
	hide: function () {
		this.$el.addClass( 'hidden' );
	}
} );

module.exports = AbuseFilterPanel;
