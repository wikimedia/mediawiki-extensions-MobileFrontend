( function( M, $ ) {

var View = M.require( 'view' ),
	Drawer = View.extend( {
		defaults: {
			cancelMessage: M.message( 'mobile-frontend-drawer-cancel' )
		},
		className: 'drawer position-fixed',

		initialize: function() {
			var self = this;
			this.$( '.close' ).click( function( ev ) {
				ev.preventDefault();
				self.hide();
			} );
			$( window ).on( 'scroll click', function() {
				self.hide();
			} );
			this.appendTo( '#mw-mf-page-center' );
		},

		show: function() {
			this.$el.addClass( 'visible' );
		},

		hide: function() {
			this.$el.removeClass( 'visible' );
		},

		isVisible: function() {
			return this.$el.hasClass( 'visible' );
		},

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
