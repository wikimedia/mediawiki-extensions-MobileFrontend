( function ( M ) {
	var AbuseFilterOverlay,
		Overlay = M.require( 'Overlay' );

	/**
	 * Overlay that shows a message about abuse. This overlay is rendered when the error code from the API
	 * is related to the abusefilter extension.
	 * @class AbuseFilterOverlay
	 * @extends Overlay
	 */
	AbuseFilterOverlay = Overlay.extend( {
		defaults: {
			confirmMessage: mw.msg( 'mobile-frontend-photo-ownership-confirm' )
		},
		templatePartials: {
			content: mw.template.get( 'mobile.abusefilter', 'Overlay.hogan' )
		},
		className: 'overlay abusefilter-overlay',

		postRender: function () {
			Overlay.prototype.postRender.apply( this, arguments );
			// make links open in separate tabs
			this.$( 'a' ).attr( 'target', '_blank' );
		}
	} );

	M.define( 'modules/editor/AbuseFilterOverlay', AbuseFilterOverlay );
}( mw.mobileFrontend ) );
