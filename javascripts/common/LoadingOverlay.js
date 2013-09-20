( function( M ) {
	var Overlay = M.require( 'Overlay' ), LoadingOverlay;

	LoadingOverlay = Overlay.extend( {
		template: M.template.get( 'LoadingOverlay' )
	} );

	M.define( 'LoadingOverlay', LoadingOverlay );
}( mw.mobileFrontend ) );
