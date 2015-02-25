( function ( M, $ ) {
	var BannerImage,
		View = M.require( 'View' ),
		browser = M.require( 'browser' ),
		ratio = ( browser.isWideScreen() ) ? 21 / 9 : 16 / 9;

	/**
	 * A banner image at the head of the page
	 * @class BannerImage
	 * @extends View
	 */
	BannerImage = View.extend( {
		className: 'banner-image',

		/**
		 * @inheritdoc
		 *
		 * @param {Object} options
		 * @param {Object} options.repository The repository from which to load images
		 */
		initialize: function ( options ) {
			this.repository = options.repository;

			View.prototype.initialize.apply( this, options );
		},
		/**
		 * @inheritdoc
		 */
		postRender: function () {
			this.loadImage();
		},

		/**
		 * Tries to load an image.
		 *
		 * If an image is successfully loaded, then the image is displayed, otherwise the view
		 * element is removed from the DOM.
		 *
		 * @method
		 */
		loadImage: function () {
			var self = this,
				targetWidth = $( window ).width();

			self.repository.getImage( targetWidth )
				.then( function ( image ) {
					self.onImageLoaded( image );
				} )
				.fail( function () {
					self.remove();
				} );
		},

		/**
		 * When we have a valid image, set it as background, bind resize events.
		 * @method
		 * @param {Image} image Image object that loaded
		 */
		onImageLoaded: function ( image ) {
			var self = this;

			self.$el
				.css( {
					'background-image': 'url("' + image.src + '")'
				} )
				.show();

			self.resizeFrame();

			if ( !self.hasLoadedOnce ) {
				self.hasLoadedOnce = true;
				M.on( 'resize', function () {
					// Don't wait until the image that best fits the width of the window has loaded
					// to resize the container.
					self.resizeFrame();

					self.loadImage();
				} );
			}
		},

		/**
		 * Resize the frame to maintain aspect a 16:9 aspect ratio.
		 */
		resizeFrame: function () {
			this.$el
				.css( {
					// Maintain 21:9 (on tablet or bigger) or 16:9 ratio
					// Max height is enforced with CSS
					height: this.$el.width() * ( 1 / ratio )
				} );
		}
	} );

	M.define( 'modules/bannerImage/BannerImage', BannerImage );

}( mw.mobileFrontend, jQuery ) );
