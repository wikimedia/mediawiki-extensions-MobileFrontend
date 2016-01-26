( function ( M ) {

	var Overlay = M.require( 'mobile.overlays/Overlay' );

	/**
	 * An {@link Overlay} that is loaded as a modal within the content and that does
	 * not take up the full screen.
	 * @class ContentOverlay
	 * @extends Overlay
	 */
	function ContentOverlay() {
		Overlay.apply( this, arguments );
	}

	OO.mfExtend( ContentOverlay, Overlay, {
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
	M.define( 'mobile.overlays/ContentOverlay', ContentOverlay );

}( mw.mobileFrontend ) );
