( function ( M, $ ) {

	var browser = M.require( 'mobile.browser/browser' ),
		View = M.require( 'mobile.view/View' ),
		Icon = M.require( 'mobile.startup/Icon' );

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
		 */
		loadImages: function () {
			var self = this,
				imagePlaceholders = this.$( '#content' ).find( '.lazy-image-placeholder' ).toArray();

			/**
			 * Load remaining images in viewport
			 */
			function _loadImages() {

				imagePlaceholders = $.grep( imagePlaceholders, function ( placeholder ) {
					var $placeholder = $( placeholder );

					if (
						mw.viewport.isElementInViewport( placeholder ) &&
						$placeholder.is( ':visible' )
					) {
						self.loadImage( $placeholder );
						return false;
					}

					return true;
				} );

				if ( !imagePlaceholders.length ) {
					M.off( 'scroll', _loadImages );
					M.off( 'resize', _loadImages );
					M.off( 'section-toggled', _loadImages );
					self.off( 'changed', _loadImages );
				}

			}

			M.on( 'scroll', _loadImages );
			M.on( 'resize', _loadImages );
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
				// Grab the image markup from the HTML only fallback
				// Image will start downloading
				$downloadingImage = $( '<img/>' );

			if ( width > 80 && height > 80 ) {
				new Icon( {
					name: 'spinner',
					additionalClassNames: 'loading'
				} ).appendTo( $placeholder );
			}

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
