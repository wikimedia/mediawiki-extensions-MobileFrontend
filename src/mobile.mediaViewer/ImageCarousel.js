const View = require( '../mobile.startup/View' ),
	util = require( '../mobile.startup/util' ),
	mfExtend = require( '../mobile.startup/mfExtend' ),
	IconButton = require( '../mobile.startup/IconButton' ),
	icons = require( '../mobile.startup/icons' ),
	eventBus = require( '../mobile.startup/eventBusSingleton' ),
	Button = require( '../mobile.startup/Button' ),
	detailsButton = new Button( {
		label: mw.msg( 'mobile-frontend-media-details' ),
		additionalClassNames: 'button',
		progressive: true
	} ),
	slideLeftButton = new IconButton( {
		rotation: 90,
		icon: 'expand-invert',
		label: mw.msg( 'mobile-frontend-media-prev' )
	} ),
	slideRightButton = new IconButton( {
		rotation: -90,
		icon: 'expand-invert',
		label: mw.msg( 'mobile-frontend-media-next' )
	} ),
	LoadErrorMessage = require( './LoadErrorMessage' ),
	ImageGateway = require( './ImageGateway' ),
	router = __non_webpack_require__( 'mediawiki.router' );

/**
 * Displays images in full screen overlay
 *
 * @class ImageCarousel
 * @extends module:mobile.startup/View
 * @param {Object} options Configuration options, see Overlay#defaults
 * @private
 */
function ImageCarousel( options ) {
	this.gateway = options.gateway || new ImageGateway( {
		api: options.api
	} );
	this.router = options.router || router;
	this.eventBus = options.eventBus;
	this.hasLoadError = false;

	View.call(
		this,
		util.extend(
			{
				className: 'image-carousel',
				events: {
					'click .image-wrapper': 'onToggleDetails',
					// Click tracking for table of contents so we can see if people interact with it
					'click .slider-button': 'onSlide'
				}
			},
			options
		)
	);
}

mfExtend( ImageCarousel, View, {
	/**
	 * @memberof ImageCarousel
	 * @instance
	 */
	template: util.template( `
<button title="{{prevMsg}}" class="prev slider-button"></button>
<div class="main">
	<div class="image-wrapper">
		<div class="image"></div>
	</div>
	<!-- cancel button will go here -->
	<div class="image-details">
		<!-- details button will go here -->
		<p class="truncated-text">{{caption}}</p>
		<p class="license"><a href="#">{{licenseLinkMsg}}</a></p>
	</div>
</div>
<button title="{{nextMsg}}" class="next slider-button"></button>
	` ),

	/**
	 * @memberof ImageCarousel
	 * @instance
	 * @mixes Overlay#defaults
	 * @property {Object} defaults Default options hash.
	 * @property {mw.Api} defaults.api instance of API to use
	 * @property {string} defaults.licenseLinkMsg Link to license information in media viewer.
	 * @property {string} defaults.prevMsg Title for "prev" button in media viewer.
	 * @property {string} defaults.nextMsg Title for "next" button in media viewer.
	 * @property {Thumbnail[]} defaults.thumbnails a list of thumbnails to browse
	 */
	defaults: util.extend( {}, View.prototype.defaults, {
		licenseLinkMsg: mw.msg( 'mobile-frontend-media-license-link' ),
		prevMsg: mw.msg( 'mobile-frontend-media-prev' ),
		nextMsg: mw.msg( 'mobile-frontend-media-next' ),
		thumbnails: []
	} ),
	/**
	 * Event handler for slide event
	 *
	 * @memberof ImageCarousel
	 * @instance
	 * @param {jQuery.Event} ev
	 */
	onSlide: function ( ev ) {
		const
			nextThumbnail = this.$el.find( ev.target ).closest( '.slider-button' ).data( 'thumbnail' ),
			title = nextThumbnail.options.filename;

		this.router.navigateTo( null, {
			path: '#/media/' + title,
			useReplaceState: true
		} );
		this.options.title = nextThumbnail.options.filename;
		const newImageCarousel = new ImageCarousel( this.options );
		this.$el.replaceWith( newImageCarousel.$el );
		this.$el = newImageCarousel.$el;
	},
	/**
	 * @inheritdoc
	 * @memberof ImageCarousel
	 * @instance
	 */
	preRender: function () {
		const self = this;
		this.options.thumbnails.forEach( ( thumbnail, i ) => {
			if ( thumbnail.getFileName() === self.options.title ) {
				self.options.caption = thumbnail.getDescription();
				self.galleryOffset = i;
			}
		} );
	},
	/**
	 * Setup the next and previous images to enable the user to arrow through
	 * all images in the set of images given in thumbs.
	 *
	 * @memberof ImageCarousel
	 * @instance
	 * @param {Array} thumbs A set of images, which are available
	 * @private
	 */
	_enableArrowImages: function ( thumbs ) {
		const offset = this.galleryOffset;
		let lastThumb, nextThumb;

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

		this.$el.find( '.prev' ).data( 'thumbnail', lastThumb );
		this.$el.find( '.next' ).data( 'thumbnail', nextThumb );
	},
	/**
	 * Disables the possibility to arrow through all images of the page.
	 *
	 * @memberof ImageCarousel
	 * @instance
	 * @private
	 */
	_disableArrowImages: function () {
		this.$el.find( '.prev, .next' ).remove();
	},

	/**
	 * Handler for retry event which triggers when user tries to reload overlay
	 * after a loading error.
	 *
	 * @memberof ImageCarousel
	 * @instance
	 * @private
	 */
	_handleRetry: function () {
		// A hacky way to simulate a reload of the overlay
		this.router.emit( 'hashchange' );
	},

	/**
	 * @inheritdoc
	 * @memberof ImageCarousel
	 * @instance
	 */
	postRender: function () {
		let
			$img;
		const
			$el = this.$el,
			$spinner = icons.spinner().$el,
			thumbs = this.options.thumbnails || [],
			self = this;

		/**
		 * Display media load failure message
		 *
		 * @method
		 * @ignore
		 */
		const showLoadFailMsg = () => {
			self.hasLoadError = true;

			$spinner.hide();
			// hide broken image if present
			$el.find( '.image img' ).hide();

			// show error message if not visible already
			if ( $el.find( '.load-fail-msg' ).length === 0 ) {
				new LoadErrorMessage( { retryPath: self.router.getPath() } )
					.on( 'retry', self._handleRetry.bind( self ) )
					.prependTo( $el.find( '.image' ) );
			}
		};

		/**
		 * Start image load transitions
		 *
		 * @method
		 * @ignore
		 */
		const addImageLoadClass = () => {
			$img.addClass( 'image-loaded' );
		};

		if ( thumbs.length < 2 ) {
			this._disableArrowImages();
		} else {
			this._enableArrowImages( thumbs );
		}

		this.$details = $el.find( '.image-details' );
		$el.find( '.image' ).append( $spinner );

		this.$details.prepend( detailsButton.$el );

		this.gateway.getThumb( self.options.title ).then( ( data ) => {
			let author;
			const url = data.descriptionurl + '#mw-jump-to-license';

			$spinner.hide();

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
			$el.find( '.image' ).append( $img );

			self.$details.addClass( 'is-visible' );
			self._positionImage();
			$el.find( '.image-details a' ).attr( 'href', url );
			if ( data.extmetadata ) {
				// Add license information
				if ( data.extmetadata.LicenseShortName ) {
					$el.find( '.license a' )
						.text( data.extmetadata.LicenseShortName.value )
						.attr( 'href', url );
				}
				// Add author information
				if ( data.extmetadata.Artist ) {
					// Strip any tags
					author = data.extmetadata.Artist.value.replace( /<.*?>/g, '' );
					$el.find( '.license' ).prepend( author + ' &bull; ' );
				}
			}
			self.adjustDetails();
		}, () => {
			// retrieving image location failed so show load fail msg
			showLoadFailMsg();
		} );

		eventBus.on( 'resize:throttled', this._positionImage.bind( this ) );
		this._positionImage();
	},

	/**
	 * Event handler that toggles the details bar.
	 *
	 * @memberof ImageCarousel
	 * @instance
	 */
	onToggleDetails: function () {
		if ( !this.hasLoadError ) {
			this.$el.find( '.cancel, .slider-button' ).toggle();
			this.$details.toggle();
			this._positionImage();
		}
	},
	/**
	 * Fit the image into the window if its dimensions are bigger than the window dimensions.
	 * Compare window width to height ratio to that of image width to height when setting
	 * image width or height.
	 *
	 * @memberof ImageCarousel
	 * @instance
	 * @private
	 */
	_positionImage: function () {
		const $window = util.getWindow();

		this.adjustDetails();
		// with a hidden details box we have a little bit more space, we just need to use it
		// TODO: Get visibility from the model
		// eslint-disable-next-line no-jquery/no-sizzle
		const detailsHeight = !this.$details.is( ':visible' ) ? 0 : this.$details.outerHeight();
		const windowWidth = $window.width();
		const windowHeight = $window.height() - detailsHeight;
		const windowRatio = windowWidth / windowHeight;
		const $img = this.$el.find( 'img' );

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

		this.$el.find( '.image-wrapper' ).css( 'bottom', detailsHeight );
		this.$el.find( '.slider-button.prev' ).append( slideLeftButton.$el );
		this.$el.find( '.slider-button.next' ).append( slideRightButton.$el );
	},

	/**
	 * Function to adjust the height of details section to not more than 50% of window height.
	 *
	 * @memberof ImageCarousel
	 * @instance
	 */
	adjustDetails: function () {
		const windowHeight = util.getWindow().height();
		if ( this.$el.find( '.image-details' ).height() > windowHeight * 0.50 ) {
			this.$el.find( '.image-details' ).css( 'max-height', windowHeight * 0.50 );
		}
	}
} );

module.exports = ImageCarousel;
