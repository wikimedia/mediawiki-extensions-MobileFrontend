( function( M ) {
	var ContentOverlay = M.require( 'ContentOverlay' ),
		LeadPhotoUploaderButton = M.require( 'modules/uploads/LeadPhotoUploaderButton' ),
		LeadPhotoTutorialOverlay,
		PageActionOverlay;

	PageActionOverlay = ContentOverlay.extend( {
		template: M.template.get( 'pageActionTutorial' ),
		defaults: {
			cancelMsg: mw.msg( 'cancel' ),
			className: 'slide active'
		}
	} );

	LeadPhotoTutorialOverlay = PageActionOverlay.extend( {
		template: M.template.get( 'pageActionTutorial' ),
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

	M.define( 'tutorials/PageActionOverlay', PageActionOverlay );
	M.define( 'tutorials/LeadPhotoTutorialOverlay', LeadPhotoTutorialOverlay );

}( mw.mobileFrontend ) );
