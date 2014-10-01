( function( M, $ ) {

var View = M.require( 'View' ),
	Panel;

	/**
	 * An abstract class for a {@link View} that comprises a simple panel.
	 * @class Panel
	 * @extends View
	 */
	Panel = View.extend( {
		className: 'panel',
		// in milliseconds
		minHideDelay: 10,
		appendToElement: '#content',

		postRender: function() {
			var self = this;
			this.$( '.cancel' ).click( function( ev ) {
				ev.preventDefault();
				self.hide();
			} );
			// This module might be loaded at the top of the page e.g. Special:Uploads
			// Thus ensure we wait for the DOM to be loaded
			$( function() {
				self.appendTo( self.appendToElement );
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
					self.emit( 'show' );
				}, self.minHideDelay );
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
				self.emit( 'hide' );
			}, self.minHideDelay );
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

M.define( 'Panel', Panel );

}( mw.mobileFrontend, jQuery ) );
