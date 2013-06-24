( function( M, $ ) {

var View = M.require( 'view' ),
	Drawer = View.extend( {
		defaults: {
			cancelMessage: mw.msg( 'mobile-frontend-drawer-cancel' )
		},
		className: 'drawer position-fixed',

		postRender: function() {
			var self = this;
			this.$( '.close' ).click( function( ev ) {
				ev.preventDefault();
				self.hide();
			} );
			this.appendTo( '#mw-mf-page-center' );
		},

		show: function() {
			var self = this;
			if ( !this.isVisible() ) {
				this.$el.addClass( 'visible' );
				// ignore a possible click that called show()
				setTimeout( function() {
					$( window ).one( 'scroll click', $.proxy( self, 'hide' ) );
				}, 0 );
			}
		},

		hide: function() {
			this.$el.removeClass( 'visible' );
		},

		isVisible: function() {
			return this.$el.hasClass( 'visible' );
		}
	} );

M.define( 'Drawer', Drawer );

}( mw.mobileFrontend, jQuery ) );
