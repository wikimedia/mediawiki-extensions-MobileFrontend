/*jshint unused:vars */
( function ( M, $ ) {

	var
		View = M.require( 'View' ),
		Icon = M.require( 'Icon' ),
		icons = M.require( 'icons' ),
		browser = M.require( 'browser' ),
		$window = $( window ),
		Overlay;

	/**
	 * Mobile modal window
	 * @class Overlay
	 * @extends View
	 * @uses Icon
	 */
	Overlay = View.extend( {
		/**
		 * Identify whether the element contains position fixed elements
		 * @type {Boolean}
		 */
		hasFixedHeader: true,
		/**
		 * FIXME: remove when OverlayManager used everywhere
		 * @type {Boolean}
		 */
		closeOnBack: false,
		/**
		 * Is overlay fullscreen
		 * @type {Boolean}
		 */
		fullScreen: true,

		/**
		 * use '#mw-mf-viewport' rather than 'body' - for some reasons this has
		 * odd consequences on Opera Mobile (see bug 52361)
		 * @type {String|jQuery.Object}
		 */
		appendTo: '#mw-mf-viewport',

		/**
		 * Default class name
		 * @type {String}
		 */
		className: 'overlay',
		templatePartials: {
			header: mw.template.get( 'mobile.overlays', 'header.hogan' )
		},
		template: mw.template.get( 'mobile.overlays', 'Overlay.hogan' ),
		/**
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {String} defaults.saveMessage Caption for save button on edit form.
		 * @cfg {String} defaults.cancelButton HTML of the cancel button.
		 * @cfg {String} defaults.backButton HTML of the back button.
		 * @cfg {String} defaults.headerButtonsListClassName A comma separated string of class
		 * names of the wrapper of the header buttons.
		 * @cfg {Boolean} defaults.fixedHeader Whether the header is fixed.
		 * @cfg {String} defaults.spinner HTML of the spinner icon.
		 */
		defaults: {
			saveMsg: mw.msg( 'mobile-frontend-editor-save' ),
			cancelButton: new Icon( {
				tagName: 'button',
				name: 'cancel',
				additionalClassNames: 'cancel',
				label: mw.msg( 'mobile-frontend-overlay-close' )
			} ).toHtmlString(),
			backButton: new Icon( {
				tagName: 'button',
				name: 'back',
				additionalClassNames: 'back',
				label: mw.msg( 'mobile-frontend-overlay-close' )
			} ).toHtmlString(),
			headerButtonsListClassName: '',
			fixedHeader: true,
			spinner: icons.spinner().toHtmlString()
		},
		/**
		 * Flag overlay to close on content tap
		 * @type {Boolean}
		 */
		closeOnContentTap: false,

		/** @inheritdoc */
		initialize: function ( options ) {
			this.isIos = browser.isIos();
			this.isIos8 = browser.isIos( 8 );
			View.prototype.initialize.apply( this, arguments );
		},
		/** @inheritdoc */
		postRender: function ( options ) {
			var
				self = this,
				$overlayContent = this.$overlayContent = this.$( '.overlay-content' ),
				startY;

			if ( this.isIos ) {
				this.$el.addClass( 'overlay-ios' );
			}
			// Truncate any text inside in the overlay header.
			this.$( '.overlay-header h2 span' ).addClass( 'truncated-text' );
			// FIXME: Remove .initial-header selector when bug 71203 resolved.
			this.$( '.cancel, .confirm, .initial-header .back' ).on( 'click', function ( ev ) {
				ev.preventDefault();
				ev.stopPropagation();
				if ( self.closeOnBack ) {
					window.history.back();
				} else {
					self.hide();
				}
			} );
			// stop clicks in the overlay from propagating to the page
			// (prevents non-fullscreen overlays from being closed when they're tapped)
			this.$el.on( 'click', function ( ev ) {
				ev.stopPropagation();
			} );

			if ( this.isIos && this.hasFixedHeader ) {
				$overlayContent
					.on( 'touchstart', function ( ev ) {
						startY = ev.originalEvent.touches[0].pageY;
					} )
					.on( 'touchmove', function ( ev ) {
						var
							y = ev.originalEvent.touches[0].pageY,
							contentLenght = $overlayContent.prop( 'scrollHeight' ) - $overlayContent.outerHeight();

						ev.stopPropagation();
						// prevent scrolling and bouncing outside of .overlay-content
						if (
							( $overlayContent.scrollTop() === 0 && startY < y ) ||
							( $overlayContent.scrollTop() === contentLenght && startY > y )
						) {
							ev.preventDefault();
						}
					} );

				// wait for things to render before doing any calculations
				setTimeout( function () {
					self._fixIosHeader( 'textarea, input' );
				}, 0 );
			}
		},

		/**
		 * Hide self when the route is visited
		 * @method
		 * @private
		 * FIXME: remove when OverlayManager used everywhere
		 */
		_hideOnRoute: function () {
			var self = this;
			M.router.once( 'route', function ( ev ) {
				if ( !self.hide() ) {
					ev.preventDefault();
					self._hideOnRoute();
				}
			} );
		},

		/**
		 * Attach overlay to current view and show it.
		 * @method
		 */
		show: function () {
			var self = this;

			// FIXME: remove when OverlayManager used everywhere
			if ( this.closeOnBack ) {
				this._hideOnRoute();
			}

			this.$el.appendTo( this.appendTo );
			this.scrollTop = document.body.scrollTop;

			if ( this.fullScreen ) {
				$( 'html' ).addClass( 'overlay-enabled' );
				// skip the URL bar if possible
				window.scrollTo( 0, 1 );
			}

			if ( this.closeOnContentTap ) {
				$( '#mw-mf-page-center' ).one( 'click', $.proxy( this, 'hide' ) );
			}

			// prevent scrolling and bouncing outside of .overlay-content
			if ( this.isIos && this.hasFixedHeader ) {
				$window
					.on( 'touchmove.ios', function ( ev ) {
						ev.preventDefault();
					} )
					.on( 'resize.ios', function () {
						self._resizeContent( $window.height() );
					} );
			}

			this.$el.addClass( 'visible' );
		},
		/**
		 * Detach the overlay from the current view
		 * @method
		 * @param {Boolean} force Whether the overlay should be closed regardless of
		 * state (see PhotoUploadProgress)
		 * @return {Boolean} Whether the overlay was successfully hidden or not
		 */
		hide: function ( force ) {
			if ( this.fullScreen ) {
				$( 'html' ).removeClass( 'overlay-enabled' );
				// return to last known scroll position
				window.scrollTo( document.body.scrollLeft, this.scrollTop );
			}

			this.$el.detach();

			if ( this.isIos ) {
				$window.off( '.ios' );
			}

			this.emit( 'hide' );

			return true;
		},

		/**
		 * Fit the overlay content height to the window taking overlay header and footer heights
		 * into consideration.
		 * @method
		 * @private
		 * @param {Number} windowHeight The height of the window
		 */
		_resizeContent: function ( windowHeight ) {
			this.$overlayContent.height(
				windowHeight -
				this.$( '.overlay-header-container' ).outerHeight() -
				this.$( '.overlay-footer-container' ).outerHeight()
			);
		},

		/**
		 * Resize .overlay-content to occupy 100% of screen space when virtual
		 * keyboard is shown/hidden on iOS.
		 *
		 * This function supplements the custom styles for Overlays on iOS.
		 * On iOS we scroll the content inside of .overlay-content div instead
		 * of scrolling the whole page to achieve a consistent sticky header
		 * effect (position: fixed doesn't work on iOS when the virtual keyboard
		 * is open).
		 *
		 * @method
		 * @private
		 * @param {String} el CSS selector for elements that may trigger virtual
		 * keyboard (usually inputs, textareas, contenteditables).
		 */
		_fixIosHeader: function ( el ) {
			var self = this;

			if ( this.isIos ) {
				this._resizeContent( $( window ).height() );
				$( el )
					.on( 'focus', function () {
						setTimeout( function () {
							var keyboardHeight = 0;

							// detect virtual keyboard height
							if ( !this.isIos8 ) {
								// this method does not work in iOS 8.02
								$window.scrollTop( 999 );
								keyboardHeight = $window.scrollTop();
								$window.scrollTop( 0 );
							} // FIXME: implement a solution from https://devforums.apple.com/message/1050636#1050636

							if ( $window.height() > keyboardHeight ) {
								self._resizeContent( $window.height() - keyboardHeight );
							}
						}, 0 );
					} )
					.on( 'blur', function () {
						self._resizeContent( $window.height() );
					} );
			}
		},

		/**
		 * Show elements that are selected by the className.
		 * Also hide .hideable elements
		 * Can't use jQuery's hide() and show() because show() sets display: block.
		 * And we want display: table for headers.
		 * @method
		 * @private
		 * @param {String} className CSS selector to show
		 */
		_showHidden: function ( className ) {
			this.$( '.hideable' ).addClass( 'hidden' );
			this.$( className ).removeClass( 'hidden' );
		}
	} );

	M.define( 'Overlay', Overlay );

}( mw.mobileFrontend, jQuery ) );
