( function ( M ) {
	var
		View = M.require( 'View' ),
		AbuseFilterOverlay = M.require( 'modules/editor/AbuseFilterOverlay' ),
		AbuseFilterPanel;

	/**
	 * Panel that shows an error message related to the abusefilter extension.
	 * @class AbuseFilterPanel
	 * @extends View
	 */
	AbuseFilterPanel = View.extend( {
		defaults: {
			readMoreMsg: mw.msg( 'mobile-frontend-editor-abusefilter-read-more' )
		},
		template: mw.template.get( 'mobile.abusefilter', 'Panel.hogan' ),
		className: 'panel hidden',

		initialize: function () {
			View.prototype.initialize.apply( this, arguments );
			this.isDisallowed = false;
		},

		show: function ( type, message ) {
			var msg;

			// OverlayManager will replace previous instance of the route if present
			M.overlayManager.add( /^\/abusefilter$/, function () {
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

		hide: function () {
			this.$el.addClass( 'hidden' );
		}
	} );

	M.define( 'modules/editor/AbuseFilterPanel', AbuseFilterPanel );

}( mw.mobileFrontend ) );
