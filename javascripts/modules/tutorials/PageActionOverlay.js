( function( M ) {
	var ContentOverlay = M.require( 'ContentOverlay' ),
		PageActionOverlay;

	PageActionOverlay = ContentOverlay.extend( {
		template: M.template.get( 'pageActionTutorial' ),
		defaults: {
			summary: mw.msg( 'mobile-frontend-lead-image-tutorial-summary' ),
			cancelMsg: mw.msg( 'mobile-frontend-photo-ownership-confirm' )
		}
	} );

	M.define( 'tutorials/PageActionOverlay', PageActionOverlay );

}( mw.mobileFrontend ) );
