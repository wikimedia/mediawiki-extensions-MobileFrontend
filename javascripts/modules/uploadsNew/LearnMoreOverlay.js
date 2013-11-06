( function( M ) {
	var OverlayNew = M.require( 'OverlayNew' ), LearnMoreOverlay;
	LearnMoreOverlay = OverlayNew.extend( {
		defaults: {
			confirmMessage: mw.msg( 'mobile-frontend-photo-ownership-confirm' )
		},
		templatePartials: {
			content: M.template.get( 'uploadsNew/LearnMoreOverlay' )
		}
	} );

	M.define( 'modules/uploadsNew/LearnMoreOverlay', LearnMoreOverlay );

}( mw.mobileFrontend ) );

