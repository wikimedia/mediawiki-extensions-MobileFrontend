( function ( M ) {

	var ContentOverlay,
		mContentOverlay,
		Overlay = M.require( 'mobile.overlays/Overlay' );

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
	mContentOverlay = M.define( 'mobile.overlays/ContentOverlay', ContentOverlay );
	mContentOverlay.deprecate( 'ContentOverlay' );
	mContentOverlay.deprecate( 'modules/tutorials/ContentOverlay' );

}( mw.mobileFrontend ) );
