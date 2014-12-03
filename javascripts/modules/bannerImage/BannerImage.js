( function ( M, $ ) {
	var BannerImage,
		md5fn = M.require( 'hex_md5' ),
		WikiDataApi = M.require( 'modules/wikigrok/WikiDataApi' ),
		View = M.require( 'View' ),
		icons = M.require( 'icons' ),
		ratio = 16 / 9;

	/**
	 * Gets a width that is close to the current screen width
	 * Limits the amount of thumbnail images being generated on the server
	 * It rounds to upper limit to try to avoid upscaling
	 * @ignore
	 *
	 * @returns {Number} pixel width of the image
	 */
	function getImageWidth( screenWidth ) {
		var i = 0,
			// Thumbnail widths
			widths = [ 320, 360, 380, 400, 420, 460, 480, 640, 680, 720, 736, 768 ],
			width;

		for ( i; i < widths.length; i++ ) {
			width = widths[ i ];
			if ( screenWidth <= width ) {
				break;
			}
		}
		return width;
	}

	/**
	 * @class HeaderImage
	 * Class in charge of a Header image. It fills up the source url, can try
	 * to load it, adjust its width/height depending on ratio, and modify the
	 * source url for use on the BannerImage class.
	 */
	function HeaderImage( title, desiredWidth ) {
		desiredWidth = getImageWidth( desiredWidth || $( window ).width() );
		this.title = title;
		this.width = desiredWidth;
		this.height = this.width / ratio;
		this.src = this.getImageUrl( title, desiredWidth );
	}

	/**
	 * Given a title work out the url to the thumbnail for that image
	 * FIXME: This should not make its way into stable.
	 * NOTE: Modified/Borrowed from from Infobox.js
	 * @method
	 * @param {String} title of file page without File: prefix
	 * @return {String} url corresponding to thumbnail (size 160px)
	 */
	HeaderImage.prototype.getImageUrl = function ( title, desiredWidth ) {
		var md5, filename, source,
			path = 'https://upload.wikimedia.org/wikipedia/commons/';
		// uppercase first letter in file name
		filename = title.charAt( 0 ).toUpperCase() + title.substr( 1 );
		// replace spaces with underscores
		filename = filename.replace( / /g, '_' );
		md5 = md5fn( filename );
		source = md5.charAt( 0 ) + '/' + md5.substr( 0, 2 ) + '/' + filename;
		if ( filename.substr( filename.length - 3 ) !== 'svg' ) {
			return path + 'thumb/' + source + '/' + desiredWidth + 'px-' + filename;
		} else {
			return path + source;
		}
	};

	/**
	 * Change width of the image (and update src url)
	 *
	 * @method
	 * @param {Number} newWidth New width in px
	 */
	HeaderImage.prototype.updateWidthAndSrc = function ( newWidth ) {
		newWidth = getImageWidth( newWidth );
		this.src = this.src.replace( this.width + 'px', newWidth + 'px' );
		this.width = newWidth;
	};

	/**
	 * Try to load image and resolve or fail when it loads / or not.
	 * @returns {$.Deferred}
	 */
	HeaderImage.prototype.load = function () {
		var loaded = $.Deferred(),
			self = this;
		// Try to load it
		// There is an issue with reliably knowing if the
		// original image is wider than the thumbnail.
		// If so, that image will fail to load.
		$( '<img>' )
			.attr( 'src', this.src )
			.load( function () {
				self.setDimensions( $( this ).width(), $( this ).height() );
				$( this ).remove();
				loaded.resolve( self );
			} )
			.error( function () {
				$( this ).remove();
				loaded.reject();
			} )
			.appendTo( $( 'body' ) )
			.hide();
		return loaded;
	};

	/**
	 * Set dimensions and ratio of the real (loaded) image
	 * @method
	 * @param {Number} width Width in pixels of the loaded image
	 * @param {Number} height Height in pixels of the loaded image
	 */
	HeaderImage.prototype.setDimensions = function ( width, height ) {
		this.dimensions = {
			width: width,
			height: height
		};
		this.imageRatio = width / height;
	};

	/**
	 * Returns true if dimensions are wider than ratio
	 *
	 * @returns {Boolean} If is wider than the desired ratio or not
	 */
	HeaderImage.prototype.widerThanRatio = function () {
		if ( this.dimensions.width / this.dimensions.height > ratio ) {
			return true;
		}
		return false;
	};

	/**
	 * Looking into the real image dimensions adjust width and height of the
	 * image to fit the ratio and avoid upscaling if image is wider than desired
	 * ratio
	 */
	HeaderImage.prototype.adjustSize = function () {
		// If the image is wider than the ratio we want, there will be
		// upscaling. Change width to a bigger image.
		if ( this.widerThanRatio() ) {
			// Width of this image we need is the height we want by the real ratio of
			// the image (to fill the height for the device width)
			this.updateWidthAndSrc( this.height * this.imageRatio );
		}
	};

	/**
	 * A WikiData banner image at the head of the page
	 * @class BannerImage
	 * @extends View
	 */
	BannerImage = View.extend( {
		className: 'wikidata-banner-image',
		defaults: {
			spinner: icons.spinner().toHtmlString()
		},
		/**
		 * @inheritdoc
		 */
		initialize: function ( options ) {
			this.api = new WikiDataApi( {
				itemId: options.itemId
			} );
			this.images = [];

			View.prototype.initialize.apply( this, options );
		},
		/**
		 * @inheritdoc
		 */
		postRender: function () {
			var self = this;

			this.api.getClaims().done( function ( claims ) {

				// Check the claims for P18 (Image)
				if (
					claims.entities &&
					claims.entities.hasOwnProperty( 'P18' ) &&
					claims.entities.P18.length
				) {

					// Parse data from the API into Image objects.
					$.each( claims.entities.P18, function ( index, image ) {
						if ( image.mainsnak.datatype === 'commonsMedia' ) {
							self.addImage( image.mainsnak.datavalue.value );
						}
					} );

					// Start trying to load images sequentially from most important to
					// least.
					self.loadImage( 0 );

				}
			} );
		},
		/**
		 * Add an image to the `images` list.
		 * @param {String} title Title of the image
		 */
		addImage: function ( title ) {
			this.images.push( new HeaderImage( title ) );
		},
		/**
		 * Async series image loading loop.
		 *
		 * Start trying to get images in series from `this.images`. When we get
		 * a valid one, don't load more and go to `this.imageLoaded` to set it as
		 * the banner
		 * @param {Number} index Image index to try and load
		 */
		loadImage: function ( index ) {

			// If we have gone through all images, and nothing got done, then
			// self-destruct!
			if ( index >= this.images.length ) {
				this.remove();
				return;
			}

			// Try to load the current image
			var image = this.images[ index ],
				loading = image.load(),
				self = this;

			// If the image loaded, we are done, leave to this.imageLoaded
			loading.done( function () {
				self.imageLoaded( image );
			} );

			// If the image didn't load, then try with the next one
			loading.fail( function () {
				self.loadImage( ++index );
			} );
		},
		/**
		 * When we have a valid image, set it as background, bind resize events.
		 * @method
		 * @param {HeaderImage} image Image object that loaded
		 */
		imageLoaded: function ( image ) {
			var self = this;

			// Adjust image src size in case it is too wide.
			image.adjustSize();

			// Set image in header
			this.$el
				.css( {
					'background-image': 'url("' + image.src + '")'
				} )
				.show();
			this.resizeImage();

			// Set resize events once
			if ( !this.resizeEventsSet ) {
				this.resizeEventsSet = true;
				M.on( 'resize', function () {
					self.resizeImage();
				} );
			}
		},
		/**
		 * Resize image to maintain aspect ratio
		 */
		resizeImage: function () {
			this.$el
				.css( {
					// Maintain 16:9 ratio
					// Max height is enforced with CSS
					height: this.$el.width() * ( 1 / ratio )
				} );
		}
	} );

	M.define( 'modules/bannerImage/BannerImage', BannerImage );

}( mw.mobileFrontend, jQuery ) );
