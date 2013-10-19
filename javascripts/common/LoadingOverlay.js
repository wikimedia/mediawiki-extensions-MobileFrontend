( function( M ) {
	var Overlay = M.require( 'Overlay' ), LoadingOverlay;

	LoadingOverlay = Overlay.extend( {
		templatePartials: {
			content: M.template.get( 'LoadingOverlay' )
		}
	} );

	M.define( 'LoadingOverlay', LoadingOverlay );
}( mw.mobileFrontend ) );
