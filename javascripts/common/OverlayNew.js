// FIXME: merge with Overlay and remove when OverlayNew gets to stable
( function( M, $ ) {

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
			this._super( options );

			this._fixIosHeader( 'textarea, input' );
		},

		_fixIosHeader: function( el ) {
			var $header = this.$( '.overlay-header-container' ), $window = $( window );
			// This is used to avoid position: fixed weirdness in mobile Safari when
			// the keyboard is visible
			if ( ( /ipad|iphone/i ).test( navigator.userAgent ) ) {
				this.$( el ).
					on( 'focus', function() {
						$header.css( 'top', $window.scrollTop() ).removeClass( 'position-fixed' );
						$window.on( 'scroll.fixIosHeader', function() {
							$header.css( 'top', $window.scrollTop() ).addClass( 'visible' );
						} );
						$window.on( 'touchmove.fixIosHeader', function() {
							// don't hide header if we're at the top
							if ( $window.scrollTop() > 0 ) {
								$header.removeClass( 'visible' );
							}
						} );
					} ).
					on( 'blur', function() {
						$header.css( 'top', 0 ).addClass( 'position-fixed visible' );
						$window.off( '.fixIosHeader' );
					} );
			}
		}
	} );

	M.define( 'OverlayNew', OverlayNew );

}( mw.mobileFrontend, jQuery ) );
