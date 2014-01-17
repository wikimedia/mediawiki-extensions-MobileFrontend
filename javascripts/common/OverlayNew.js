// FIXME: merge with Overlay and remove when OverlayNew gets to stable
( function( M ) {

	var Overlay = M.require( 'Overlay' ), OverlayNew;
	/**
	 * @name OverlayNew
	 * @extends Overlay
	 * @class
	 */
	OverlayNew = Overlay.extend( {
		className: 'overlay',
		template: M.template.get( 'OverlayNew' ),
		defaults: {
			headerButtonsListClassName: 'v-border bottom-border',
			closeMsg: mw.msg( 'mobile-frontend-overlay-close' ),
			fixedHeader: true
		},

		postRender: function( options ) {
			var self = this;
			this._super( options );

			// This is used to avoid position: fixed weirdness in mobile Safari when
			// the keyboard is visible
			if ( ( /ipad|iphone/i ).test( navigator.userAgent ) ) {
				this.$( 'textarea, input' ).
					on( 'focus', function() {
						self.$( '.overlay-header-container' ).removeClass( 'position-fixed' );
					} ).
					on( 'blur', function() {
						self.$( '.overlay-header-container' ).addClass( 'position-fixed' );
					} );
			}
		}
	} );

	M.define( 'OverlayNew', OverlayNew );

}( mw.mobileFrontend ) );
