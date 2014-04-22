( function( M, $ ) {

var View = M.require( 'View' ),
	Drawer;

	/**
	 * A {@link View} that pops up from the bottom of the screen.
	 * @class Drawer
	 * @extends View
	 */
	Drawer = View.extend( {
		defaults: {
			cancelMessage: mw.msg( 'mobile-frontend-drawer-cancel' )
		},
		className: 'drawer position-fixed',
		minHideDelay: 0, // ms

		postRender: function() {
			var self = this;
			// FIXME: Standardise on either close or cancel to be consistent with Overlay.js
			this.$( '.close' ).click( function( ev ) {
				ev.preventDefault();
				self.hide();
			} );
			// This module might be loaded at the top of the page e.g. Special:Uploads
			// Thus ensure we wait for the DOM to be loaded
			// FIXME: This should be moved out of Drawer.js. Caller should actually append to DOM.
			$( function() {
				self.appendTo( '#notifications' );
			} );
		},

		/**
		 * @method
		 */
		show: function() {
			var self = this;

			if ( !self.isVisible() ) {
				// use setTimeout to allow the browser to redraw if render() was called
				// just before show(); this is important for animations to work
				// (0ms doesn't work on Firefox, 10ms is enough)
				setTimeout( function() {
					self.$el.addClass( 'visible' );
					if ( !self.locked ) {
						// ignore a possible click that called show()
						setTimeout( function() {
							$( window ).one( 'scroll.drawer', $.proxy( self, 'hide' ) );
							// FIXME change when micro.tap.js in stable
							// can't use 'body' because the drawer will be closed when
							// tapping on it and clicks will be prevented
							$( '#mw-mf-page-center, .mw-mf-overlay' ).one( M.tapEvent( 'click' ) + '.drawer', $.proxy( self, 'hide' ) );
						}, self.minHideDelay );
					}
				}, 10 );
			}
		},

		/**
		 * @method
		 */
		hide: function() {
			var self = this;

			// see comment in show()
			setTimeout( function() {
				self.$el.removeClass( 'visible' );
				// .one() registers one callback for scroll and click independently
				// if one fired, get rid of the other one
				$( window ).off( '.drawer' );
				$( '#mw-mf-page-center, .mw-mf-overlay' ).off( '.drawer' );
			}, 10 );
		},

		/**
		 * @method
		 */
		isVisible: function() {
			return this.$el.hasClass( 'visible' );
		},

		/**
		 * @method
		 */
		toggle: function() {
			if ( this.isVisible() ) {
				this.hide();
			} else {
				this.show();
			}
		}
	} );

M.define( 'Drawer', Drawer );

}( mw.mobileFrontend, jQuery ) );
