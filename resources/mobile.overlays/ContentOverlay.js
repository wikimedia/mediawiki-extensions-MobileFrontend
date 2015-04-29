( function ( M ) {

	var ContentOverlay,
		Overlay = M.require( 'Overlay' );

	/**
	 * An {@link Overlay} that is loaded as a modal within the content and that does
	 * not take up the full screen.
	 * @class ContentOverlay
	 * @extends Overlay
	 */
	ContentOverlay = Overlay.extend( {
		/** @inheritdoc */
		templatePartials: {},
		className: 'overlay content-overlay',
		/**
		 * @inheritdoc
		 */
		fullScreen: false,
		/**
		 * @inheritdoc
		 */
		closeOnContentTap: true,
		/**
		 * @inheritdoc
		 */
		appendToElement: '#mw-mf-page-center'
	} );
	// FIXME: Here for backwards compatibility. Remove when fully deprecated
	M.define( 'modules/tutorials/ContentOverlay', ContentOverlay );
	M.define( 'ContentOverlay', ContentOverlay );

}( mw.mobileFrontend ) );
