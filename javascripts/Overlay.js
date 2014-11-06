/*jshint unused:vars */
( function ( M, $ ) {

	var
		View = M.require( 'View' ),
		Icon = M.require( 'Icon' ),
		$window = $( window ),
		Overlay;

	/**
	 * Mobile modal window
	 * @class Overlay
	 * @extends View
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
		 * Default classname
		 * @type {String}
		 */
		className: 'overlay',
		templatePartials: {
			spinner: mw.template.get( 'mobile.ajax', 'spinner.hogan' )
		},
		template: mw.template.get( 'mobile.overlays', 'Overlay.hogan' ),
		defaults: {
			cancelButton: new Icon( { tagName: 'button',
					name: 'cancel', additionalClassNames: 'cancel',
					label: mw.msg( 'mobile-frontend-overlay-close' )
				} ).toHtmlString(),
			backButton: new Icon( { tagName: 'button',
					name: 'back', additionalClassNames: 'back',
					label: mw.msg( 'mobile-frontend-overlay-close' )
				} ).toHtmlString(),
			headerButtonsListClassName: '',
			fixedHeader: true
		},
		/**
		 * Flag overlay to close on content tap
		 * @type {Boolean}
		 */
		closeOnContentTap: false,

		postRender: function ( options ) {
			var
				self = this,
				$overlayContent = this.$overlayContent = this.$( '.overlay-content' ),
				startY;

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

			if ( M.isIos && this.hasFixedHeader ) {
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

		// FIXME: remove when OverlayManager used everywhere
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
		 * Attach overlay to current view
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
			if ( M.isIos && this.hasFixedHeader ) {
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
		 *
		 * @method
		 * @param {boolean} force: Whether the overlay should be closed regardless of state (see PhotoUploadProgress)
		 * @return {boolean}: Whether the overlay was successfully hidden or not
		 */
		hide: function ( force ) {
			var self = this;

			// FIXME: allow zooming outside the overlay again
			// M.unlockViewport();
			// FIXME: remove when OverlayManager used everywhere
			if ( this.parent ) {
				this.parent.show();
			} else if ( this.fullScreen ) {
				$( 'html' ).removeClass( 'overlay-enabled' );
				// return to last known scroll position
				window.scrollTo( document.body.scrollLeft, this.scrollTop );
			}

			this.$el.removeClass( 'visible' );
			// give time for animations to finish
			setTimeout( function () {
				self.$el.detach();
			}, 1000 );

			if ( M.isIos ) {
				$window.off( '.ios' );
			}

			this.emit( 'hide' );

			return true;
		},

		_resizeContent: function ( windowHeight ) {
			this.$overlayContent.height( windowHeight - this.$( '.overlay-header-container' ).outerHeight() - this.$( '.overlay-footer-container' ).outerHeight() );
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
		 * @param {string} el CSS selector for elements that may trigger virtual
		 * keyboard (usually inputs, textareas, contenteditables).
		 */
		_fixIosHeader: function ( el ) {
			var self = this;

			if ( M.isIos ) {
				this._resizeContent( $( window ).height() );
				$( el )
					.on( 'focus', function () {
						setTimeout( function () {
							var keyboardHeight = 0;

							// detect virtual keyboard height
							if ( !M.isIos8 ) {
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

		_showHidden: function ( className ) {
			// can't use jQuery's hide() and show() beause show() sets display: block
			// and we want display: table for headers
			this.$( '.hideable' ).addClass( 'hidden' );
			this.$( className ).removeClass( 'hidden' );
		}
	} );

	M.define( 'Overlay', Overlay );

}( mw.mobileFrontend, jQuery ) );
