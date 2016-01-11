( function ( M ) {
	var
		View = M.require( 'mobile.view/View' ),
		AbuseFilterOverlay = M.require( 'mobile.abusefilter/AbuseFilterOverlay' ),
		overlayManager = M.require( 'mobile.startup/overlayManager' );

	/**
	 * Panel that shows an error message related to the abusefilter extension.
	 * @class AbuseFilterPanel
	 * @extends View
	 * @uses AbuseFilterOverlay
	 * FIXME: should extend Panel not View. Or the name should be changed to something meaningful.
	 */
	function AbuseFilterPanel() {
		this.isDisallowed = false;
		View.apply( this, arguments );
	}

	OO.mfExtend( AbuseFilterPanel, View, {
		/**
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {String} defaults.readMoreMsg A caption for the button allowing the user to read
		 * more about the problems with their edit.
		 */
		defaults: {
			readMoreMsg: mw.msg( 'mobile-frontend-editor-abusefilter-read-more' )
		},
		template: mw.template.get( 'mobile.abusefilter', 'Panel.hogan' ),
		className: 'panel hidden',

		/**
		 * Show the panel. Create a route to show AbuseFilterOverlay with message.
		 * @method
		 * @param {String} type The type of alert, e.g. 'warning' or 'disallow'
		 * @param {String} message Message to show in the AbuseFilter overlay
		 */
		show: function ( type, message ) {
			var msg;

			// OverlayManager will replace previous instance of the route if present
			overlayManager.add( /^\/abusefilter$/, function () {
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

			this.$( '.message p' ).text( msg );
			this.$el.removeClass( 'hidden' );
		},

		/**
		 * Hide the panel.
		 * @method
		 */
		hide: function () {
			this.$el.addClass( 'hidden' );
		}
	} );

	M.define( 'mobile.abusefilter/AbuseFilterPanel', AbuseFilterPanel );

}( mw.mobileFrontend ) );
