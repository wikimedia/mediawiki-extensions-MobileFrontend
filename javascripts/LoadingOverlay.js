( function ( M ) {
	var Overlay = M.require( 'Overlay' ), LoadingOverlay;

	/**
	 * Overlay that initially shows loading animation until
	 ** caller hides it with .hide()
	 * @class LoadingOverlay
	 * @extends Overlay
	 */
	LoadingOverlay = Overlay.extend( {
		template: M.template.get( 'LoadingOverlay.hogan' )
	} );

	M.define( 'LoadingOverlay', LoadingOverlay );
}( mw.mobileFrontend ) );
