var
	browser = require( './Browser' ).getSingleton(),
	View = require( './View' ),
	util = require( './util' ),
	Page = require( './Page' ),
	Deferred = util.Deferred,
	when = util.when,
	icons = require( './icons' ),
	viewport = mw.viewport,
	spinner = icons.spinner(),
	mfExtend = require( './mfExtend' ),
	M = require( './moduleSingleton' );

/**
 * Get the id of the section $el belongs to.
 * @param {jQuery.Object} $el
 * @return {string|null} either the anchor (id attribute of the section heading
 *  or null if none found)
 */
function getSectionId( $el ) {
	var id,
		hSelector = Page.HEADING_SELECTOR,
		$parent = $el.parent(),
		// e.g. matches Subheading in
		// <h2>H</h2><div><h3 id="subheading">Subh</h3><a class="element"></a></div>
		$heading = $el.prevAll( hSelector ).eq( 0 );

	if ( $heading.length ) {
		id = $heading.find( '.mw-headline' ).attr( 'id' );
		if ( id ) {
			return id;
		}
	}
	if ( $parent.length ) {
		// if we couldnt find a sibling heading, check the sibling of the parents
		// consider <div><h2 /><div><$el/></div></div>
		return getSectionId( $parent );
	} else {
		return null;
	}
}

/**
 * Representation of the current skin being rendered.
 *
 * @class Skin
 * @extends View
 * @uses Browser
 * @uses Page
 * @fires Skin#click
 * @fires Skin#references-loaded
 * @fires Skin#changed
 *
 * @param {Object} options Configuration options
 */
function Skin( options ) {
	var self = this;

	this.page = options.page;
	this.name = options.name;
	if ( options.mainMenu ) {
		this.mainMenu = options.mainMenu;
		mw.log.warn( 'Skin: Use of mainMenu is deprecated.' );
	}
	View.call( this, options );
	this.referencesGateway = options.referencesGateway;

	if (
		mw.config.get( 'wgMFLazyLoadImages' )
	) {
		util.docReady( function () {
			self.setupImageLoading();
		} );
	}

	if ( mw.config.get( 'wgMFLazyLoadReferences' ) ) {
		M.on( 'before-section-toggled', this.lazyLoadReferences.bind( this ) );
	}
}

mfExtend( Skin, View, {
	/**
	 * Skin contains components that we do not control
	 * @inheritdoc
	 * @memberof Skin
	 * @instance
	 */
	isBorderBox: false,
	/**
	 * @memberof Skin
	 * @instance
	 * @mixes View#defaults
	 * @property {Object} defaults Default options hash.
	 * @property {Page} defaults.page page the skin is currently rendering
	 * @property {ReferencesGateway} defaults.referencesGateway instance of references gateway
	 */
	defaults: {
		page: undefined
	},

	/**
	 * @inheritdoc
	 * @memberof Skin
	 * @instance
	 */
	events: {},

	/**
	 * @inheritdoc
	 * @memberof Skin
	 * @instance
	 */
	postRender: function () {
		var $el = this.$el;
		if ( browser.supportsAnimations() ) {
			$el.addClass( 'animations' );
		}
		if ( browser.supportsTouchEvents() ) {
			$el.addClass( 'touch-events' );
		}
		util.parseHTML( '<div class="transparent-shield cloaked-element">' )
			.appendTo( $el.find( '#mw-mf-page-center' ) );
		/**
		 * Fired when appearance of skin changes.
		 * @event Skin#changed
		 */
		this.emit( 'changed' );

		/**
		 * Fired when the skin is clicked.
		 * @event Skin#click
		 */
		this.$( '#mw-mf-page-center' ).on( 'click', this.emit.bind( this, 'click' ) );
	},
	/**
	 * Get images that have not yet been loaded in the page
	 * @memberof Skin
	 * @instance
	 * @param {jQuery.Object} [$container] The container that should be
	 *  searched for image placeholders. Defaults to "#content".
	 * @return {Array} of unloaded image placeholders in the page
	 */
	getUnloadedImages: function ( $container ) {
		$container = $container || this.$( '#content' );
		return $container.find( '.lazy-image-placeholder' ).toArray();
	},
	/**
	 * Setup listeners to watch unloaded images and load them into the page
	 * as and when they are needed.
	 * @memberof Skin
	 * @instance
	 * @param {jQuery.Object} [$container] The container that should be
	 *  searched for image placeholders. Defaults to "#content".
	 * @return {jQuery.Deferred} which will be resolved when the attempts to
	 *  load all images subject to loading have been completed.
	 */
	setupImageLoading: function ( $container ) {
		var self = this,
			offset = util.getWindow().height() * 1.5,
			loadImagesList = this.loadImagesList.bind( this ),
			imagePlaceholders = this.getUnloadedImages( $container );

		/**
		 * Check whether an image should be loaded based on its proximity to the
		 * viewport; and whether it is displayed to the user.
		 * @param {jQuery.Object} $placeholder
		 * @return {boolean}
		 */
		function shouldLoadImage( $placeholder ) {
			return viewport.isElementCloseToViewport( $placeholder[0], offset ) &&
				// If a placeholder is an inline element without a height attribute set
				// it will record as hidden
				// to circumvent this we also need to test the height (see T143768).
				( $placeholder.is( ':visible' ) || $placeholder.height() === 0 );
		}

		/**
		 * Load remaining images in viewport
		 * @return {jQuery.Deferred}
		 */
		function _loadImages() {
			var images = [];
			// Filter unloaded images to only the images that still need to be loaded
			imagePlaceholders = util.grep( imagePlaceholders, function ( placeholder ) {
				var $placeholder = self.$( placeholder );
				// Check length to ensure the image is still in the DOM.
				if ( $placeholder.length && shouldLoadImage( $placeholder ) ) {
					images.push( placeholder );
					return false;
				}
				return true;
			} );

			// When no images are left unbind all events
			if ( !imagePlaceholders.length ) {
				M.off( 'scroll:throttled', _loadImages );
				M.off( 'resize:throttled', _loadImages );
				M.off( 'section-toggled', _loadImages );
				self.off( 'changed', _loadImages );
			}

			// load any remaining images.
			return loadImagesList( images );
		}

		M.on( 'scroll:throttled', _loadImages );
		M.on( 'resize:throttled', _loadImages );
		M.on( 'section-toggled', _loadImages );
		this.on( 'changed', _loadImages );

		return _loadImages();
	},
	/**
	 * Load an image on demand
	 * @memberof Skin
	 * @instance
	 * @param {Array} [images] a list of images that have not been loaded.
	 *  If none given all will be loaded.
	 * @return {jQuery.Deferred}
	 */
	loadImagesList: function ( images ) {
		var callbacks,
			$ = this.$.bind( this ),
			loadImage = this.loadImage.bind( this );

		images = images || this.getUnloadedImages();
		callbacks = images.map( function ( placeholder ) {
			return loadImage( $( placeholder ) );
		} );

		return when.apply( null, callbacks );
	},
	/**
	 * Load an image on demand
	 * @memberof Skin
	 * @instance
	 * @param {jQuery.Object} $placeholder
	 * @return {jQuery.Deferred}
	 */
	loadImage: function ( $placeholder ) {
		var
			d = Deferred(),
			width = $placeholder.attr( 'data-width' ),
			height = $placeholder.attr( 'data-height' ),
			// document must be passed to ensure image will start downloading
			$downloadingImage = util.parseHTML( '<img>', this.$el[0].ownerDocument );

		// When the image has loaded
		$downloadingImage.on( 'load', function () {
			// Swap the HTML inside the placeholder (to keep the layout and
			// dimensions the same and not trigger layouts
			$downloadingImage.addClass( 'image-lazy-loaded' );
			$placeholder.replaceWith( $downloadingImage );
			d.resolve();
		} );
		$downloadingImage.on( 'error', function () {
			d.reject();
		} );

		// Trigger image download after binding the load handler
		$downloadingImage.attr( {
			'class': $placeholder.attr( 'data-class' ),
			width: width,
			height: height,
			src: $placeholder.attr( 'data-src' ),
			alt: $placeholder.attr( 'data-alt' ),
			style: $placeholder.attr( 'style' ),
			srcset: $placeholder.attr( 'data-srcset' )
		} );
		return d;
	},

	/**
	 * Load the references section content from API if it's not already loaded.
	 *
	 * All references tags content will be loaded per section.
	 * @memberof Skin
	 * @instance
	 * @param {Object} data Information about the section. It's in the following form:
	 * {
	 *     @property {string} page,
	 *     @property {boolean} wasExpanded,
	 *     @property {jQuery.Object} $heading,
	 *     @property {boolean} isReferenceSection
	 * }
	 * @return {jQuery.Promise} rejected when not a reference section.
	 */
	lazyLoadReferences: function ( data ) {
		var $content, $spinner,
			gateway = this.referencesGateway,
			getUnloadedImages = this.getUnloadedImages.bind( this ),
			loadImagesList = this.loadImagesList.bind( this ),
			self = this;

		// If the section was expanded before toggling, do not load anything as
		// section is being collapsed now.
		// Also return early if lazy loading is not required or the section is
		// not a reference section
		if (
			data.wasExpanded ||
			!data.isReferenceSection
		) {
			return;
		}

		$content = data.$heading.next();

		function loadImagesAndSetData() {
			// lazy load images if any
			loadImagesList( getUnloadedImages( $content ) );
			// Do not attempt further loading even if we're unable to load this time.
			$content.data( 'are-references-loaded', 1 );
		}

		if ( !$content.data( 'are-references-loaded' ) ) {
			$content.children().addClass( 'hidden' );
			$spinner = spinner.$el.prependTo( $content );

			// First ensure we retrieve all of the possible lists
			return gateway.getReferencesLists( data.page )
				.then( function () {
					var lastId;

					$content.find( '.mf-lazy-references-placeholder' ).each( function () {
						var refListIndex = 0,
							$placeholder = $content.find( this ),
							// search for id of the collapsible heading
							id = getSectionId( $placeholder );

						if ( lastId !== id ) {
							// If the placeholder belongs to a new section reset index
							refListIndex = 0;
							lastId = id;
						} else {
							// otherwise increment it
							refListIndex++;
						}

						if ( id ) {
							gateway.getReferencesList( data.page, id )
								.then( function ( refListElements ) {
									// Note if no section html is provided
									// no substitution will happen
									// so user is forced to rely on placeholder link.
									if ( refListElements && refListElements[refListIndex] ) {
										$placeholder.replaceWith(
											refListElements[refListIndex]
										);
									}
								} );
						}
					} );
					// Show the section now the references lists have been placed.
					$spinner.remove();
					$content.children().removeClass( 'hidden' );
					/**
					 * Fired when references list is loaded into the HTML
					 * @event references-loaded
					 */
					self.emit( 'references-loaded', self.page );

					loadImagesAndSetData();
				}, function () {
					$spinner.remove();
					// unhide on a failure
					$content.children().removeClass( 'hidden' );

					loadImagesAndSetData();
				} );
		} else {
			return Deferred().reject().promise();
		}
	},

	/**
	 * Returns the appropriate license message including links/name to
	 * terms of use (if any) and license page
	 * @memberof Skin
	 * @instance
	 * @return {string}
	 */
	getLicenseMsg: function () {
		var licenseMsg,
			mfLicense = mw.config.get( 'wgMFLicense' ),
			licensePlural = mw.language.convertNumber( mfLicense.plural );

		if ( mfLicense.link ) {
			if ( this.$( '#footer-places-terms-use' ).length > 0 ) {
				licenseMsg = mw.msg(
					'mobile-frontend-editor-licensing-with-terms',
					mw.message(
						'mobile-frontend-editor-terms-link',
						this.$( '#footer-places-terms-use a' ).attr( 'href' )
					).parse(),
					mfLicense.link,
					licensePlural
				);
			} else {
				licenseMsg = mw.msg(
					'mobile-frontend-editor-licensing',
					mfLicense.link,
					licensePlural
				);
			}
		}
		return licenseMsg;
	}
} );

Skin.getSectionId = getSectionId;

module.exports = Skin;
