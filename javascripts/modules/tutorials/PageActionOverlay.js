( function ( M ) {
	var ContentOverlay = M.require( 'modules/tutorials/ContentOverlay' ),
		PageActionOverlay;

	/**
	 * Page overlay prompting a user for given action
	 * @class PageActionOverlay
	 * @extends ContentOverlay
	 */
	PageActionOverlay = ContentOverlay.extend( {
		className: 'overlay content-overlay tutorial-overlay',
		template: mw.template.get( 'mobile.contentOverlays', 'PageActionOverlay.hogan' ),
		/**
		 * @inheritdoc
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {String} defaults.cancelMsg Cancel message.
		 */
		defaults: {
			cancelMsg: mw.msg( 'cancel' )
		},
		/**
		 * @inheritdoc
		 */
		events: {
			'click .cancel': 'hide'
		}
	} );

	M.define( 'modules/tutorials/PageActionOverlay', PageActionOverlay );

}( mw.mobileFrontend ) );
