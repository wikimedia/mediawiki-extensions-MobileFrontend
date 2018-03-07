( function ( M ) {
	var Overlay = M.require( 'mobile.startup/Overlay' ),
		util = M.require( 'mobile.startup/util' ),
		Icon = M.require( 'mobile.startup/Icon' ),
		Button = M.require( 'mobile.startup/Button' ),
		ImageGateway = M.require( 'mobile.mediaViewer/ImageGateway' );

	/**
	 * Displays images in full screen overlay
	 * @class ImageOverlay
	 * @extends Overlay
	 * @uses Icon
	 * @uses ImageGateway
	 *
	 * @constructor
	 * @param {Object} options Configuration options
	 */
	function ImageOverlay( options ) {
		this.gateway = new ImageGateway( {
			api: options.api
		} );
		Overlay.apply( this, arguments );
	}

	OO.mfExtend( ImageOverlay, Overlay, {
		// allow pinch zooming
		hasFixedHeader: false,
		hideOnExitClick: false,
		className: 'overlay media-viewer',
		template: mw.template.get( 'mobile.mediaViewer', 'Overlay.hogan' ),

		/**
		 * @inheritdoc
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {mw.Api} defaults.api instance of API to use
		 * @cfg {string} defaults.cancelButton HTML of the cancel button.
		 * @cfg {Object} defaults.detailsButton options for details button
		 * @cfg {string} defaults.licenseLinkMsg Link to license information in media viewer.
		 * @cfg {Thumbnail[]} defaults.thumbnails a list of thumbnails to browse
		 */
		defaults: util.extend( {}, Overlay.prototype.defaults, {
			cancelButton: new Icon( {
				tagName: 'button',
				// Uses a dark theme so swap out the icon
				name: 'overlay-close-gray',
				additionalClassNames: 'cancel',
				label: mw.msg( 'mobile-frontend-overlay-close' )
			} ).toHtmlString(),
			detailsButton: new Button( {
				label: mw.msg( 'mobile-frontend-media-details' ),
				additionalClassNames: 'button',
				progressive: true
			} ).options,
			licenseLinkMsg: mw.msg( 'mobile-frontend-media-license-link' ),
			thumbnails: [],
			slideLeftButton: new Icon( {
				rotation: 90,
				name: 'arrow-invert'
			} ).toHtmlString(),
			slideRightButton: new Icon( {
				rotation: -90,
				name: 'arrow-invert'
			} ).toHtmlString()
		} ),

		/** @inheritdoc */
		events: util.extend( {}, Overlay.prototype.events, {
			'click .image-wrapper': 'onToggleDetails',
			// Click tracking for table of contents so we can see if people interact with it
			'click .slider-button': 'onSlide'
		} ),
		/**
		 * Event handler for slide event
		 * @param {jQuery.Event} ev
		 */
		onSlide: function ( ev ) {
			var nextThumbnail = this.$( ev.target ).closest( '.slider-button' ).data( 'thumbnail' );
			this.emit( ImageOverlay.EVENT_SLIDE, nextThumbnail );
		},
		/** @inheritdoc */
		preRender: function () {
			var self = this;
			this.options.thumbnails.forEach( function ( thumbnail, i ) {
				if ( thumbnail.getFileName() === self.options.title ) {
					self.options.caption = thumbnail.getDescription();
					self.galleryOffset = i;
				}
			} );
		},

		/**
		 * Setup the next and previous images to enable the user to arrow through
		 * all images in the set of images given in thumbs.
		 * @param {Array} thumbs A set of images, which are available
		 * @private
		 */
		_enableArrowImages: function ( thumbs ) {
			var offset = this.galleryOffset,
				lastThumb, nextThumb;

			// identify last thumbnail
			lastThumb = offset === 0 ? thumbs[thumbs.length - 1] : thumbs[offset - 1];
			nextThumb = offset === thumbs.length - 1 ? thumbs[0] : thumbs[offset + 1];
			this.$( '.prev' ).data( 'thumbnail', lastThumb );
			this.$( '.next' ).data( 'thumbnail', nextThumb );
		},

		/**
		 * Disables the possibility to arrow through all images of the page.
		 * @private
		 */
		_disableArrowImages: function () {
			this.$( '.prev, .next' ).remove();
		},

		/** @inheritdoc */
		postRender: function () {
			var $img,
				thumbs = this.options.thumbnails || [],
				self = this;

			if ( thumbs.length < 2 ) {
				this._disableArrowImages();
			} else {
				this._enableArrowImages( thumbs );
			}

			this.$details = this.$( '.details' );

			Overlay.prototype.postRender.apply( this );

			this.gateway.getThumb( self.options.title ).done( function ( data ) {
				var author, url = data.descriptionurl + '#mw-jump-to-license';

				/**
				 * Hide the spinner
				 * @method
				 * @ignore
				 */
				function removeLoader() {
					self.$( '.spinner' ).hide();
				}

				self.thumbWidth = data.thumbwidth;
				self.thumbHeight = data.thumbheight;
				self.imgRatio = data.thumbwidth / data.thumbheight;
				$img = self.parseHTML( '<img>' ).attr( 'src', data.thumburl ).attr( 'alt', self.options.caption );
				self.$( '.image' ).append( $img );

				if ( $img.prop( 'complete' ) ) {
					// if the image is loaded from browser cache, "load" event may not fire
					// (http://stackoverflow.com/questions/910727/jquery-event-for-images-loaded#comment10616132_1110094)
					removeLoader();
				} else {
					// remove the loader when the image is loaded
					$img.on( 'load', removeLoader );
				}
				self._positionImage();
				self.$( '.details a' ).attr( 'href', url );
				if ( data.extmetadata ) {
					// Add license information
					if ( data.extmetadata.LicenseShortName ) {
						self.$( '.license a' )
							.text( data.extmetadata.LicenseShortName.value )
							.attr( 'href', url );
					}
					// Add author information
					if ( data.extmetadata.Artist ) {
						// Strip any tags
						author = data.extmetadata.Artist.value.replace( /<.*?>/g, '' );
						self.$( '.license' ).prepend( author + ' &bull; ' );
					}
				}
				self.adjustDetails();
			} );

			M.on( 'resize:throttled', this._positionImage.bind( this ) );
		},

		/**
		 * Event handler that toggles the details bar.
		 */
		onToggleDetails: function () {
			this.$( '.cancel, .slider-button' ).toggle();
			this.$details.toggle();
			this._positionImage();
		},

		// fixme: remove this redundant function.
		onExitClick: function ( ev ) {
			Overlay.prototype.onExitClick.apply( this, arguments );
			this.emit( ImageOverlay.EVENT_EXIT, ev );
		},

		/** @inheritdoc */
		show: function () {
			Overlay.prototype.show.apply( this, arguments );
			this._positionImage();
		},

		/**
		 * Fit the image into the window if its dimensions are bigger than the window dimensions.
		 * Compare window width to height ratio to that of image width to height when setting
		 * image width or height.
		 * @method
		 * @private
		 */
		_positionImage: function () {
			var detailsHeight, windowWidth, windowHeight, windowRatio, $img,
				$window = util.getWindow();

			this.adjustDetails();
			// with a hidden details box we have a little bit more space, we just need to use it
			detailsHeight = !this.$details.is( ':visible' ) ? 0 : this.$details.outerHeight();
			windowWidth = $window.width();
			windowHeight = $window.height() - detailsHeight;
			windowRatio = windowWidth / windowHeight;
			$img = this.$( 'img' );

			if ( this.imgRatio > windowRatio ) {
				if ( windowWidth < this.thumbWidth ) {
					$img.css( {
						width: windowWidth,
						height: 'auto'
					} );
				}
			} else {
				if ( windowHeight < this.thumbHeight ) {
					$img.css( {
						width: 'auto',
						height: windowHeight
					} );
				}
			}
			this.$( '.image-wrapper' ).css( 'bottom', detailsHeight );
		},

		/**
		 * Function to adjust the height of details section to not more than 50% of window height.
		 * @method
		 */
		adjustDetails: function () {
			var windowHeight = util.getWindow().height();
			if ( this.$( '.details' ).height() > windowHeight * 0.50 ) {
				this.$( '.details' ).css( 'max-height', windowHeight * 0.50 );
			}
		}
	} );
	// fixme: remove this redundant constant.
	/** @ignore @event ImageOverlay#ImageOverlay-exit */
	ImageOverlay.EVENT_EXIT = 'ImageOverlay-exit';
	/** @ignore @event ImageOverlay#ImageOverlay-slide */
	ImageOverlay.EVENT_SLIDE = 'ImageOverlay-slide';
	M.define( 'mobile.mediaViewer/ImageOverlay', ImageOverlay ); // resource-modules-disable-line

}( mw.mobileFrontend ) );
