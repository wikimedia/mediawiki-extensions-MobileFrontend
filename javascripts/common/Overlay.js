/*jshint unused:vars */
( function( M, $ ) {

	var View = M.require( 'View' ), Overlay;
	/**
	 * @class Overlay
	 * @extends View
	 */
	Overlay = View.extend( {
		/**
		 * FIXME: remove when OverlayManager used everywhere
		 * @type {Boolean}
		 */
		closeOnBack: false,
		/**
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
		 * @type {String}
		 */
		className: 'overlay border-box',
		template: M.template.get( 'OverlayNew' ),
		defaults: {
			headerButtonsListClassName: 'v-border bottom-border',
			closeMsg: mw.msg( 'mobile-frontend-overlay-close' ),
			fixedHeader: true
		},
		/**
		 * @type {Boolean}
		 */
		closeOnContentTap: false,

		postRender: function( options ) {
			var self = this;
			// FIXME change when micro.tap.js in stable
			this.$( '.cancel, .confirm' ).on( M.tapEvent( 'click' ), function( ev ) {
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
			this.$el.on( M.tapEvent( 'click' ), function( ev ) {
				ev.stopPropagation();
			} );

			this._fixIosHeader( 'textarea, input' );
		},

		// FIXME: remove when OverlayManager used everywhere
		_hideOnRoute: function() {
			var self = this;
			M.router.one( 'route', function( ev ) {
				if ( !self.hide() ) {
					ev.preventDefault();
					self._hideOnRoute();
				}
			} );
		},

		/**
		 * @method
		 */
		show: function() {
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
				$( '#mw-mf-page-center' ).one( M.tapEvent( 'click' ), $.proxy( this, 'hide' ) );
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
		hide: function( force ) {
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
			setTimeout(function() {
				self.$el.detach();
			}, 1000 );

			this.emit( 'hide' );

			return true;
		},

		_fixIosHeader: function( el ) {
			var $header = this.$( '.overlay-header-container' ), $window = $( window );
			// This is used to avoid position: fixed weirdness in mobile Safari when
			// the keyboard is visible
			if ( ( /ipad|iphone/i ).test( navigator.userAgent ) ) {
				this.$( el ).
					on( 'focus', function() {
						$header.removeClass( 'position-fixed' );
						// don't show fixed header on iPhone, it causes bug 62120
						// (also, there is a Done button on the keyboard anyway)
						if ( M.isWideScreen() ) {
							$header.css( 'top', $window.scrollTop() );
							$window.on( 'scroll.fixIosHeader', function() {
								$header.css( 'top', $window.scrollTop() ).addClass( 'visible' );
							} );
							$window.on( 'touchmove.fixIosHeader', function() {
								// don't hide header if we're at the top
								if ( $window.scrollTop() > 0 ) {
									$header.removeClass( 'visible' );
								}
							} );
						}
					} ).
					on( 'blur', function() {
						$header.css( 'top', 0 ).addClass( 'position-fixed visible' );
						$window.off( '.fixIosHeader' );
					} );
			}
		},

		_showHidden: function( className ) {
			// can't use jQuery's hide() and show() beause show() sets display: block
			// and we want display: table for headers
			this.$( '.hideable' ).addClass( 'hidden' );
			this.$( className ).removeClass( 'hidden' );
		}
	} );

	// FIXME: Deprecate OverlayNew
	M.define( 'OverlayNew', Overlay );
	M.define( 'Overlay', Overlay );

}( mw.mobileFrontend, jQuery ) );
