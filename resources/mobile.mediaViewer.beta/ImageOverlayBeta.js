( function ( M, $ ) {
	var ImageOverlay = M.require( 'modules/mediaViewer/ImageOverlay' ),
		Swipe = M.require( 'Swipe' ),
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
			this.swipe.disable();
		}
	} );

	M.define( 'modules/mediaViewer/ImageOverlayBeta', ImageOverlayBeta );

}( mw.mobileFrontend, jQuery ) );
