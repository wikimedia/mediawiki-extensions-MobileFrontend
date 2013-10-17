( function( M ) {
	var LeadPhotoUploaderButton = M.require( 'modules/uploads/LeadPhotoUploaderButton' ),
		PageActionOverlay = M.require( 'modules/tutorials/PageActionOverlay' ),
		LeadPhotoTutorialOverlay;

	LeadPhotoTutorialOverlay = PageActionOverlay.extend( {
		defaults: {
			className: 'slide active photo-upload',
			summary: mw.msg( 'mobile-frontend-lead-image-tutorial-summary' ),
			cancelMsg: mw.msg( 'cancel' )
		},
		postRender: function( options ) {
			this._super( options );
			new LeadPhotoUploaderButton( {
				el: this.$( '.button' ),
				label: mw.msg( 'mobile-frontend-lead-image-tutorial-confirm' ),
				pageTitle: mw.config.get( 'wgTitle' ), insertInPage: true } );
		}
	} );

	M.define( 'modules/tutorials/LeadPhotoTutorialOverlay', LeadPhotoTutorialOverlay );

}( mw.mobileFrontend ) );
