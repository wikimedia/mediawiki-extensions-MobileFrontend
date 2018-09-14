( function ( M ) {
	var Overlay = M.require( 'mobile.startup/Overlay' ),
		util = M.require( 'mobile.startup/util' ),
		Icon = M.require( 'mobile.startup/Icon' ),
		Button = M.require( 'mobile.startup/Button' ),
		LoadErrorMessage = M.require( 'mobile.mediaViewer/LoadErrorMessage' ),
		ImageGateway = M.require( 'mobile.mediaViewer/ImageGateway' ),
		router = require( 'mediawiki.router' );

	/**
	 * Displays images in full screen overlay
	 * @class ImageOverlay
	 * @extends Overlay
	 * @uses Icon
	 * @uses ImageGateway
	 * @uses LoadErrorMessage
	 * @uses Router
	 * @fires ImageOverlay#ImageOverlay-exit
	 * @fires ImageOverlay#ImageOverlay-slide
	 * @param {Object} options Configuration options
	 */
	function ImageOverlay( options ) {
		this.gateway = options.gateway || new ImageGateway( {
			api: options.api
		} );
		this.router = options.router || router;

		Overlay.apply( this, arguments );
	}

	OO.mfExtend( ImageOverlay, Overlay, {
		/**
		 * allow pinch zooming
		 * @memberof ImageOverlay
		 * @instance
		 */
		hasFixedHeader: false,
		/**
		 * @memberof ImageOverlay
		 * @instance
		 */
		hideOnExitClick: false,
		/**
		 * @memberof ImageOverlay
		 * @instance
		 */
		className: 'overlay media-viewer',
		/**
		 * @memberof ImageOverlay
		 * @instance
		 */
		template: mw.template.get( 'mobile.mediaViewer', 'Overlay.hogan' ),

		/**
		 * @memberof ImageOverlay
		 * @instance
		 * @mixes Overlay#defaults
		 * @property {Object} defaults Default options hash.
		 * @property {mw.Api} defaults.api instance of API to use
		 * @property {string} defaults.cancelButton HTML of the cancel button.
		 * @property {Object} defaults.detailsButton options for details button
		 * @property {string} defaults.licenseLinkMsg Link to license information in media viewer.
		 * @property {Thumbnail[]} defaults.thumbnails a list of thumbnails to browse
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
		/**
		 * @inheritdoc
		 * @memberof ImageOverlay
		 * @instance
		 */
		events: util.extend( {}, Overlay.prototype.events, {
			'click .image-wrapper': 'onToggleDetails',
			// Click tracking for table of contents so we can see if people interact with it
			'click .slider-button': 'onSlide'
		} ),
		/**
		 * Event handler for slide event
		 * @memberof ImageOverlay
		 * @instance
		 * @param {jQuery.Event} ev
		 */
		onSlide: function ( ev ) {
			var nextThumbnail = this.$( ev.target ).closest( '.slider-button' ).data( 'thumbnail' );
			this.emit( ImageOverlay.EVENT_SLIDE, nextThumbnail );
		},
		/**
		 * @inheritdoc
		 * @memberof ImageOverlay
		 * @instance
		 */
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
		 * @memberof ImageOverlay
		 * @instance
		 * @param {Array} thumbs A set of images, which are available
		 * @private
		 */
		_enableArrowImages: function ( thumbs ) {
			var offset = this.galleryOffset,
				lastThumb, nextThumb;

			if ( this.galleryOffset === undefined ) {
				// couldn't find a suitable matching thumbnail so make
				// next slide start at beginning and previous slide be end
				lastThumb = thumbs[thumbs.length - 1];
				nextThumb = thumbs[0];
			} else {
				// identify last thumbnail
				lastThumb = thumbs[ offset === 0 ? thumbs.length - 1 : offset - 1 ];
				nextThumb = thumbs[ offset === thumbs.length - 1 ? 0 : offset + 1 ];
			}

			this.$( '.prev' ).data( 'thumbnail', lastThumb );
			this.$( '.next' ).data( 'thumbnail', nextThumb );
		},
		/**
		 * Disables the possibility to arrow through all images of the page.
		 * @memberof ImageOverlay
		 * @instance
		 * @private
		 */
		_disableArrowImages: function () {
			this.$( '.prev, .next' ).remove();
		},

		/**
		 * Handler for retry event which triggers when user tries to reload overlay
		 * after a loading error.
		 * @memberof ImageOverlay
		 * @instance
		 * @private
		 */
		_handleRetry: function () {
			// A hacky way to simulate a reload of the overlay
			this.router.emit( 'hashchange' );
		},

		/**
		 * @inheritdoc
		 * @memberof ImageOverlay
		 * @instance
		 */
		postRender: function () {
			var $img,
				thumbs = this.options.thumbnails || [],
				self = this;

			/**
			 * Hide the spinner
			 * @method
			 * @ignore
			 */
			function removeLoader() {
				self.hideSpinner();
			}

			/**
			 * Display media load failure message
			 * @method
			 * @ignore
			 */
			function showLoadFailMsg() {
				self.hasLoadError = true;

				removeLoader();
				// hide broken image if present
				self.$( '.image img' ).hide();

				// show error message if not visible already
				if ( self.$( '.load-fail-msg' ).length === 0 ) {
					new LoadErrorMessage( { retryPath: self.router.getPath() } )
						.on( 'retry', self._handleRetry.bind( self ) )
						.prependTo( self.$( '.image' ) );
				}
			}

			/**
			 * Start image load transitions
			 * @method
			 * @ignore
			 */
			function addImageLoadClass() {
				$img.addClass( 'image-loaded' );
			}

			if ( thumbs.length < 2 ) {
				this._disableArrowImages();
			} else {
				this._enableArrowImages( thumbs );
			}

			this.$details = this.$( '.details' );

			Overlay.prototype.postRender.apply( this );

			this.gateway.getThumb( self.options.title ).then( function ( data ) {
				var author, url = data.descriptionurl + '#mw-jump-to-license';

				removeLoader();

				self.thumbWidth = data.thumbwidth;
				self.thumbHeight = data.thumbheight;
				self.imgRatio = data.thumbwidth / data.thumbheight;

				// We need to explicitly specify document for context param as jQuery 3
				// will create a new document for the element if the context is
				// undefined. If element is appended to active document, event handlers
				// can fire in both the active document and new document which can cause
				// insidious bugs.
				// (https://api.jquery.com/jquery.parsehtml/#entry-longdesc)
				$img = self.parseHTML( '<img>', document );

				// Remove the loader when the image is loaded or display load fail
				// message on failure
				//
				// Error event handler must be attached before error occurs
				// (https://api.jquery.com/error/#entry-longdesc)
				//
				// For the load event, it is more unclear what happens cross-browser when
				// the image is loaded from cache. It seems that a .complete check is
				// needed if attaching the load event after setting the src.
				// (http://stackoverflow.com/questions/910727/jquery-event-for-images-loaded#comment10616132_1110094)
				//
				// However, perhaps .complete check is not needed if attaching load
				// event prior to setting the image src
				// (https://stackoverflow.com/questions/12354865/image-onload-event-and-browser-cache#answer-12355031)
				$img.on( 'load', addImageLoadClass ).on( 'error', showLoadFailMsg );
				$img.attr( 'src', data.thumburl ).attr( 'alt', self.options.caption );
				self.$( '.image' ).append( $img );

				self.$details.addClass( 'is-visible' );
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
			}, function () {
				// retrieving image location failed so show load fail msg
				showLoadFailMsg();
			} );

			M.on( 'resize:throttled', this._positionImage.bind( this ) );
		},

		/**
		 * Event handler that toggles the details bar.
		 * @memberof ImageOverlay
		 * @instance
		 */
		onToggleDetails: function () {
			if ( !this.hasLoadError ) {
				this.$( '.cancel, .slider-button' ).toggle();
				this.$details.toggle();
				this._positionImage();
			}
		},

		/**
		 * fixme: remove this redundant function.
		 * @memberof ImageOverlay
		 * @instance
		 * @param {Event} ev
		 */
		onExitClick: function ( ev ) {
			Overlay.prototype.onExitClick.apply( this, arguments );
			this.emit( ImageOverlay.EVENT_EXIT, ev );
		},

		/**
		 * @inheritdoc
		 * @memberof ImageOverlay
		 * @instance
		 */
		show: function () {
			Overlay.prototype.show.apply( this, arguments );
			this._positionImage();
		},

		/**
		 * Fit the image into the window if its dimensions are bigger than the window dimensions.
		 * Compare window width to height ratio to that of image width to height when setting
		 * image width or height.
		 * @memberof ImageOverlay
		 * @instance
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
		 * @memberof ImageOverlay
		 * @instance
		 */
		adjustDetails: function () {
			var windowHeight = util.getWindow().height();
			if ( this.$( '.details' ).height() > windowHeight * 0.50 ) {
				this.$( '.details' ).css( 'max-height', windowHeight * 0.50 );
			}
		}
	} );

	/**
	 * fixme: remove this redundant constant.
	 * @memberof ImageOverlay
	 * @event
	 */
	ImageOverlay.EVENT_EXIT = 'ImageOverlay-exit';
	/**
	 * @memberof ImageOverlay
	 * @event
	 */
	ImageOverlay.EVENT_SLIDE = 'ImageOverlay-slide';
	M.define( 'mobile.mediaViewer/ImageOverlay', ImageOverlay ); // resource-modules-disable-line

}( mw.mobileFrontend ) );
