( function ( M ) {
	var LoadingOverlay,
		Overlay = M.require( 'Overlay' );

	/**
	 * Overlay that initially shows loading animation until
	 ** caller hides it with .hide()
	 * @class LoadingOverlay
	 * @extends Overlay
	 */
	LoadingOverlay = Overlay.extend( {
		template: mw.template.get( 'mobile.overlays', 'LoadingOverlay.hogan' )
	} );

	M.define( 'LoadingOverlay', LoadingOverlay );
}( mw.mobileFrontend ) );
