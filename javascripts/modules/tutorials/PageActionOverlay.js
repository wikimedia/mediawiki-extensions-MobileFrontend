( function( M ) {
	var ContentOverlay = M.require( 'ContentOverlay' ),
		PageActionOverlay;

	PageActionOverlay = ContentOverlay.extend( {
		template: M.template.get( 'modules/tutorials/PageActionOverlay' ),
		defaults: {
			cancelMsg: mw.msg( 'cancel' ),
			className: 'slide active'
		}
	} );

	M.define( 'modules/tutorials/PageActionOverlay', PageActionOverlay );

}( mw.mobileFrontend ) );
