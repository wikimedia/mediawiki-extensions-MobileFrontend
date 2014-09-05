( function( M, $ ) {

var View = M.require( 'View' ),
	InlineDialog;

	/**
	 * A {@link View} that gets inserted within the page content (inline)
	 * @class InlineDialog
	 * @extends View
	 */
	InlineDialog = View.extend( {
		defaults: {
			// Reuse drawer message since this is a similar interface
			cancelMessage: mw.msg( 'mobile-frontend-drawer-cancel' )
		},
		className: 'inline-dialog',
		minHideDelay: 0, // ms

		postRender: function() {
			var self = this;
			this.$( '.cancel' ).click( function( ev ) {
				ev.preventDefault();
				self.hide();
			} );
			// Append the dialog to a DOM element
			// This module might be loaded at the top of the page, thus ensure we wait for
			// the DOM to be loaded before appending.
			$( function() {
				self.appendTo( '#content' );
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
					self.$el.show();
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
				self.$el.hide();
			}, 10 );
		},

		/**
		 * @method
		 */
		isVisible: function() {
			return this.$el.is( ':visible' );
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

M.define( 'InlineDialog', InlineDialog );

}( mw.mobileFrontend, jQuery ) );
