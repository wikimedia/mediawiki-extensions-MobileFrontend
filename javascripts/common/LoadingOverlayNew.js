( function( M ) {
	var OverlayNew = M.require( 'OverlayNew' ), LoadingOverlayNew;

	LoadingOverlayNew = OverlayNew.extend( {
		template: M.template.get( 'LoadingOverlay' )
	} );

	M.define( 'LoadingOverlayNew', LoadingOverlayNew );
}( mw.mobileFrontend ) );
