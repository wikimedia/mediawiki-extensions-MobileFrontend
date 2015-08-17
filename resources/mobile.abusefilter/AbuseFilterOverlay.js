( function ( M, $ ) {
	var AbuseFilterOverlay,
		Button = M.require( 'mobile.startup/Button' ),
		Overlay = M.require( 'mobile.overlays/Overlay' );

	/**
	 * Overlay that shows a message about abuse. This overlay is rendered when the error code from the API
	 * is related to the abusefilter extension.
	 * @class AbuseFilterOverlay
	 * @extends Overlay
	 */
	AbuseFilterOverlay = Overlay.extend( {
		/**
		 * @inheritdoc
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {Object} defaults.confirmButton options for a confirm Button
		 */
		defaults: $.extend( {}, Overlay.prototype.defaults, {
			confirmButton: new Button( {
				additionalClassNames: 'cancel',
				progressive: true,
				label: mw.msg( 'mobile-frontend-photo-ownership-confirm' )
			} ).options
		} ),
		templatePartials: $.extend( {}, Overlay.prototype.templatePartials, {
			button: Button.prototype.template,
			content: mw.template.get( 'mobile.abusefilter', 'Overlay.hogan' )
		} ),
		className: 'overlay abusefilter-overlay',

		/** @inheritdoc */
		postRender: function () {
			Overlay.prototype.postRender.apply( this );
			// make links open in separate tabs
			this.$( 'a' ).attr( 'target', '_blank' );
		}
	} );

	M.define( 'mobile.abusefilter/AbuseFilterOverlay', AbuseFilterOverlay );
}( mw.mobileFrontend, jQuery ) );
