( function ( M ) {
	var ContentOverlay = M.require( 'modules/tutorials/ContentOverlay' ),
		PageActionOverlay;

	/**
	 * Page overlay prompting a user for given action
	 * @class PageActionOverlay
	 * @extends ContentOverlay
	 */
	PageActionOverlay = ContentOverlay.extend( {
		template: mw.template.get( 'mobile.contentOverlays', 'PageActionOverlay.hogan' ),
		defaults: {
			cancelMsg: mw.msg( 'cancel' )
		}
	} );

	M.define( 'modules/tutorials/PageActionOverlay', PageActionOverlay );

}( mw.mobileFrontend ) );
