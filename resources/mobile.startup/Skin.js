( function ( M, $ ) {

	var browser = M.require( 'mobile.browser/browser' ),
		View = M.require( 'mobile.view/View' ),
		icons = M.require( 'mobile.startup/icons' );

	/**
	 * Representation of the current skin being rendered.
	 *
	 * @class Skin
	 * @extends View
	 * @uses Browser
	 * @uses Page
	 */
	function Skin( options ) {
		var self = this;

		this.page = options.page;
		this.name = options.name;
		this.mainMenu = options.mainMenu;
		View.call( this, options );
		// Must be run after merging with defaults as must be defined.
		this.tabletModules = options.tabletModules;
		this.referencesGateway = options.referencesGateway;

		/**
		 * Tests current window size and if suitable loads styles and scripts specific for larger devices
		 *
		 * @method
		 * @ignore
		 */
		function loadWideScreenModules() {
			if ( browser.isWideScreen() ) {
				// Adjust screen for tablets
				if ( self.page.inNamespace( '' ) ) {
					mw.loader.using( self.tabletModules ).always( function () {
						self.off( '_resize' );
						self.emit.call( self, 'changed' );
					} );
				}
			}
		}
		M.on( 'resize', $.proxy( this, 'emit', '_resize' ) );
		this.on( '_resize', loadWideScreenModules );
		this.emit( '_resize' );

		if (
			!mw.config.get( 'wgImagesDisabled' ) &&
			mw.config.get( 'wgMFLazyLoadImages' )
		) {
			$( function () {
				self.loadImages();
			} );
		}

		if ( mw.config.get( 'wgMFLazyLoadReferences' ) ) {
			M.on( 'before-section-toggled', $.proxy( this.lazyLoadReferences, this ) );
		}
	}

	OO.mfExtend( Skin, View, {
		/**
		 * @inheritdoc
		 * Skin contains components that we do not control
		 */
		isBorderBox: false,
		/**
		 * @inheritdoc
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {Page} defaults.page page the skin is currently rendering
		 * @cfg {Array} defaults.tabletModules modules to load when in tablet
		 * @cfg {MainMenu} defaults.mainMenu instance of the mainMenu
		 * @cfg {ReferencesGateway} defaults.referencesGateway instance of references gateway
		 */
		defaults: {
			page: undefined,
			tabletModules: [],
			mainMenu: undefined
		},

		/**
		 * @inheritdoc
		 */
		events: {},

		/**
		 * Close navigation if content tapped
		 * @param {jQuery.Event} ev
		 * @private
		 */
		_onPageCenterClick: function ( ev ) {
			var $target = $( ev.target );

			// Make sure the menu is open and we are not clicking on the menu button
			if (
				this.mainMenu.isOpen() &&
				!$target.hasClass( 'main-menu-button' )
			) {
				this.mainMenu.closeNavigationDrawers();
				ev.preventDefault();
			}
		},

		/**
		 * Setup position fixed emulation using position absolute.
		 */
		setupPositionFixedEmulation: function () {
			var $el = this.$el,
				// FIXME: Move all the variables below to Browser.js
				ua = window.navigator.userAgent,
				isIos = browser.isIos(),
				isOldIPhone = isIos && /OS [4]_[0-2]|OS [3]_/.test( ua );

			$el.addClass( 'no-position-fixed' );
			this.on( 'scroll', function () {
				var scrollTop = $( window ).scrollTop(),
					windowHeight = $( window ).height(),
					activeElement = document.activeElement,
					scrollBottom = scrollTop + windowHeight;
				if ( isOldIPhone ) {
					if ( activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT' ) {
						// add the height of the open soft keyboard
						scrollBottom -= 120;
					} else {
						// add the height of the address bar
						scrollBottom += 60;
					}
				}

				if ( scrollTop === 0 ) {
					// special case when we're at the beginning of the page and many
					// browsers (e.g. Android 2.x) return wrong window height because
					// of the URL bar
					$el.add( '.overlay' ).height( '100%' );
				} else {
					// keep expanding the viewport until the end of the page reached
					// #notification has bottom: 0 and sticks to the end of the viewport
					$el.add( '.overlay' ).height( scrollBottom );
				}
			} );
		},
		/**
		 * @inheritdoc
		 */
		postRender: function () {
			var $el = this.$el;
			if ( browser.supportsAnimations() ) {
				$el.addClass( 'animations' );
			}
			if ( !browser.supportsPositionFixed() ) {
				this.setupPositionFixedEmulation();
			}
			if ( browser.supportsTouchEvents() ) {
				$el.addClass( 'touch-events' );
			}
			$( '<div class="transparent-shield cloaked-element">' ).appendTo( '#mw-mf-page-center' );
			/**
			 * @event changed
			 * Fired when appearance of skin changes.
			 */
			this.emit( 'changed' );
			// FIXME: Move back into events when T98200 resolved
			this.$( '#mw-mf-page-center' ).on( 'click',
				$.proxy( this, '_onPageCenterClick' ) );
		},

		/**
		 * Return the instance of MainMenu
		 * @returns {MainMenu}
		 */
		getMainMenu: function () {
			return this.mainMenu;
		},

		/**
		 * Load images on demand
		 * @param {jQuery.Object} [$container] The container that should be
		 *  searched for image placeholders. Defaults to "#content".
		 */
		loadImages: function ( $container ) {
			var self = this,
				offset = $( window ).height() * 1.5,
				imagePlaceholders;

			$container = $container || this.$( '#content' );
			imagePlaceholders = $container.find( '.lazy-image-placeholder' ).toArray();

			/**
			 * Load remaining images in viewport
			 */
			function _loadImages() {

				imagePlaceholders = $.grep( imagePlaceholders, function ( placeholder ) {
					var $placeholder = $( placeholder );

					if (
						mw.viewport.isElementCloseToViewport( placeholder, offset ) &&
						$placeholder.is( ':visible' )
					) {
						self.loadImage( $placeholder );
						return false;
					}

					return true;
				} );

				if ( !imagePlaceholders.length ) {
					M.off( 'scroll:throttled', _loadImages );
					M.off( 'resize:throttled', _loadImages );
					M.off( 'section-toggled', _loadImages );
					self.off( 'changed', _loadImages );
				}

			}

			M.on( 'scroll:throttled', _loadImages );
			M.on( 'resize:throttled', _loadImages );
			M.on( 'section-toggled', _loadImages );
			this.on( 'changed', _loadImages );

			_loadImages();
		},

		/**
		 * Load an image on demand
		 * @param {jQuery.Object} $placeholder
		 */
		loadImage: function ( $placeholder ) {
			var
				width = $placeholder.attr( 'data-width' ),
				height = $placeholder.attr( 'data-height' ),
				// Image will start downloading
				$downloadingImage = $( '<img/>' );

			// When the image has loaded
			$downloadingImage.on( 'load', function () {
				// Swap the HTML inside the placeholder (to keep the layout and
				// dimensions the same and not trigger layouts
				$placeholder.empty().append( $downloadingImage );
				// Set the loaded class after insertion of the HTML to trigger the
				// animations.
				$placeholder.addClass( 'loaded' );
			} );

			// Trigger image download after binding the load handler
			$downloadingImage.attr( {
				'class': $placeholder.attr( 'data-class' ),
				width: width,
				height: height,
				src: $placeholder.attr( 'data-src' ),
				alt: $placeholder.attr( 'data-alt' ),
				srcset: $placeholder.attr( 'data-srcset' )
			} );
		},

		/**
		* Load the references section content from API if it's not already loaded.
		*
		* @param {Object} data Information about the section. It's in the following form:
		*  {
		*      @property {String} page,
		*      @property {Boolean} wasExpanded,
		*      @property {jQuery.Object} $heading,
		*      @property {Boolean} isReferenceSection
		* }
		*/
		lazyLoadReferences: function ( data ) {
			var $content, $originalContent,
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

			if ( !$content.data( 'are-references-loaded' ) ) {
				$originalContent = $content.children().clone( true, true );
				$content.html( icons.spinner().toHtmlString() );

				this.referencesGateway
					.getReferencesSection( data.page, data.$heading.find( '.mw-headline' ).attr( 'id' ) )
					.done( function ( section ) {
						$content.html( section !== false ? section : $originalContent );
						/**
						 * @event references-loaded
						 * Fired when references list is loaded into the HTML
						 */
						self.emit( 'references-loaded', self.page );
					} )
					.fail( function () {
						$content.html( $originalContent );
					} )
					.always( function () {
						// lazy load images if any
						self.loadImages( $content );
						// Do not attempt further loading even if we're unable to load this time.
						$content.data( 'are-references-loaded', 1 );
					} );
			}
		},

		/**
		 * Returns the appropriate license message including links/name to
		 * terms of use (if any) and license page
		 */
		getLicenseMsg: function () {
			var licenseMsg,
				mfLicense = mw.config.get( 'wgMFLicense' ),
				licensePlural = mw.language.convertNumber( mfLicense.plural );

			if ( mfLicense.link ) {
				if ( $( '#footer-places-terms-use' ).length > 0 ) {
					licenseMsg = mw.msg(
						'mobile-frontend-editor-licensing-with-terms',
						mw.message(
							'mobile-frontend-editor-terms-link',
							$( '#footer-places-terms-use a' ).attr( 'href' )
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

	M.define( 'mobile.startup/Skin', Skin );

}( mw.mobileFrontend, jQuery ) );
