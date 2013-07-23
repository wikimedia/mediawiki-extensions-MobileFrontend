( function( M ) {
	var ContentOverlay = M.require( 'ContentOverlay' ),
		LeadPhotoUploaderButton = M.require( 'modules/uploads/LeadPhotoUploaderButton' ),
		LeadPhotoTutorialOverlay,
		PageActionOverlay;

	PageActionOverlay = ContentOverlay.extend( {
		template: M.template.get( 'pageActionTutorial' ),
		defaults: {
			summary: mw.msg( 'mobile-frontend-lead-image-tutorial-summary' ),
			cancelMsg: mw.msg( 'cancel' )
		}
	} );

	LeadPhotoTutorialOverlay = PageActionOverlay.extend( {
		template: M.template.get( 'pageActionTutorial' ),
		postRender: function( options ) {
			this._super( options );
			new LeadPhotoUploaderButton( {
				el: this.$( '.button' ),
				label: 'Start uploading',
				pageTitle: mw.config.get( 'wgTitle' ), insertInPage: true } );
		}
	} );

	M.define( 'tutorials/PageActionOverlay', PageActionOverlay );
	M.define( 'tutorials/LeadPhotoTutorialOverlay', LeadPhotoTutorialOverlay );

}( mw.mobileFrontend ) );
