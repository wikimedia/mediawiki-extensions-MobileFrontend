( function ( M, $ ) {
	var ImageOverlayNew,
		Icon = M.require( 'Icon' ),
		ImageOverlay = M.require( 'modules/mediaViewer/ImageOverlay' );

	/**
	 * Displays images in full screen overlay
	 * @class ImageOverlayNew
	 * @extends ImageOverlay
	 */
	ImageOverlayNew = ImageOverlay.extend( {
		template: mw.template.get( 'mobile.mediaViewer.beta', 'Overlay.hogan' ),
		templatePartials: {
			content: mw.template.get( 'mobile.mediaViewer', 'Overlay.hogan' )
		},
		events: $.extend( {}, ImageOverlay.prototype.events, {
			// Click tracking for table of contents so we can see if people interact with it
			'click .slider-button': 'onSlide'
		} ),
		/**
		 * Event handler for slide event
		 * @param {jQuery.Event} ev
		 */
		onSlide: function ( ev ) {
			var thumbnail = $( ev.target ).closest( '.slider-button' ).data( 'thumbnail' );
			window.location.hash = '#/media/' + thumbnail.getFileName();
		},
		defaults: $.extend( {}, ImageOverlay.prototype.defaults, {
			slideLeftButton: new Icon( {
				name: 'previous'
			} ).toHtmlString(),
			slideRightButton: new Icon( {
				name: 'next'
			} ).toHtmlString()
		} ),
		/** @inheritdoc */
		postRender: function ( options ) {
			var lastThumb, nextThumb,
				offset = this.galleryOffset,
				thumbs = options.thumbnails || [];

			if ( thumbs.length < 2 ) {
				this.$( '.prev, .next' ).remove();
			} else {
				// identify last thumbnail
				lastThumb = offset === 0 ? thumbs[thumbs.length - 1] : thumbs[offset - 1];
				nextThumb = offset === thumbs.length - 1 ? thumbs[0] : thumbs[offset + 1];
				this.$( '.prev' ).data( 'thumbnail', lastThumb );
				this.$( '.next' ).data( 'thumbnail', nextThumb );
			}
			ImageOverlay.prototype.postRender.call( this, options );
		}
	} );
	M.define( 'modules/mediaViewer/ImageOverlayNew', ImageOverlayNew );

}( mw.mobileFrontend, jQuery ) );
