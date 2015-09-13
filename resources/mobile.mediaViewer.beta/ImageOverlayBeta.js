( function ( M, $ ) {
	var ImageOverlay = M.require( 'mobile.mediaViewer/ImageOverlay' ),
		Swipe = M.require( 'mobile.swipe/Swipe' ),
		ImageOverlayBeta;

	/**
	 * Extends ImageOverlay to add a swipe functionality
	 * @class ImageOverlayBeta
	 * @extends ImageOverlay
	 */
	ImageOverlayBeta = ImageOverlay.extend( {
		/** @inheritdoc */
		_enableArrowImages: function ( thumbs ) {
			var self = this;

			this.swipe = new Swipe();
			this.swipe
				.on( 'swipe-right', function () {
					self.setNewImage( $( '.slider-button.prev' ).data( 'thumbnail' ) );
				} )
				.on( 'swipe-left', function () {
					self.setNewImage( $( '.slider-button.next' ).data( 'thumbnail' ) );
				} )
				.setElement( this.$el );

			ImageOverlay.prototype._enableArrowImages.call( this, thumbs );
		},

		/** @inheritdoc */
		_disableArrowImages: function () {
			ImageOverlay.prototype._disableArrowImages.apply( this );
			if ( this.swipe ) {
				this.swipe.disable();
			}
		}
	} );

	M.define( 'mobile.mediaViewer.beta/ImageOverlayBeta', ImageOverlayBeta )
		.deprecate( 'modules/mediaViewer/ImageOverlayBeta' );

}( mw.mobileFrontend, jQuery ) );
