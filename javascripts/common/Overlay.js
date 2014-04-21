/*jshint unused:vars */
( function( M, $ ) {

var View = M.require( 'View' ),
	Overlay;

	/**
	 * @class
	 * @name Overlay
	 * @extends View
	 */
	Overlay = View.extend( {
		defaults: {
			closeMsg: mw.msg( 'mobile-frontend-overlay-escape' )
		},
		/**
		 * @name Overlay.prototype.template
		 * @type {Hogan.Template}
		 */
		template: M.template.get( 'overlay' ),
		/**
		 * @name Overlay.prototype.className
		 * @type {String}
		 */
		className: 'mw-mf-overlay',
		/**
		 * FIXME: remove when OverlayManager used everywhere
		 * @name Overlay.prototype.closeOnBack
		 * @type {Boolean}
		 */
		closeOnBack: false,
		/**
		 * @name Overlay.prototype.closeOnContentTap
		 * @type {Boolean}
		 */
		closeOnContentTap: false,
		/**
		 * @name Overlay.prototype.fullScreen
		 * @type {Boolean}
		 */
		fullScreen: true,
		/**
		 * use '#mw-mf-viewport' rather than 'body' - for some reasons this has
		 * odd consequences on Opera Mobile (see bug 52361)
		 * @name Overlay.prototype.appendTo
		 * @type {String|jQuery.Object}
		 */
		appendTo: '#mw-mf-viewport',
		initialize: function( options ) {
			options = options || {};
			this.parent = options.parent;
			this.isOpened = false;
			this._super( options );
		},
		postRender: function() {
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
		 * @name Overlay.prototype.show
		 * @function
		 */
		show: function() {
			// FIXME: remove when OverlayManager used everywhere
			if ( this.closeOnBack ) {
				this._hideOnRoute();
			}

			// FIXME: prevent zooming within overlays but don't break the rendering!
			// M.lockViewport();
			// FIXME: remove when OverlayManager used everywhere
			if ( this.parent ) {
				this.parent.hide( true );
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
		 * @name Overlay.prototype.hide
		 * @function
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
		}
	} );

M.define( 'Overlay', Overlay );

}( mw.mobileFrontend, jQuery ) );
