( function ( M ) {
	var Overlay = M.require( 'mobile.overlays/Overlay' );

	/**
	 * Overlay that initially shows loading animation until
	 * caller hides it with .hide()
	 * @class LoadingOverlay
	 * @extends Overlay
	 */
	function LoadingOverlay() {
		Overlay.apply( this, arguments );
	}

	OO.mfExtend( LoadingOverlay, Overlay, {
		template: mw.template.get( 'mobile.overlays', 'LoadingOverlay.hogan' )
	} );

	M.define( 'mobile.overlays/LoadingOverlay', LoadingOverlay );
}( mw.mobileFrontend ) );
