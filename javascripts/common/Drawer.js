( function( M, $ ) {

var View = M.require( 'view' ),
	Drawer = View.extend( {
		defaults: {
			cancelMessage: mw.msg( 'mobile-frontend-drawer-cancel' )
		},
		className: 'drawer position-fixed',
		minHideDelay: 0, // ms

		postRender: function() {
			var self = this;
			this.$( '.close' ).click( function( ev ) {
				ev.preventDefault();
				self.hide();
			} );
			this.appendTo( '#notifications' );
		},

		show: function() {
			var self = this;
			if ( !this.isVisible() ) {
				this.$el.addClass( 'visible' );
				if ( !this.locked ) {
					// ignore a possible click that called show()
					setTimeout( function() {
						$( window ).one( 'scroll.drawer', $.proxy( self, 'hide' ) );
						// FIXME change when micro.tap.js in stable
						$( '#mw-mf-page-center' ).one( ( mw.config.get( 'wgMFMode' ) === 'alpha' ? 'tap' : 'click' ) + '.drawer', $.proxy( self, 'hide' ) );
					}, this.minHideDelay );
				}
			}
		},

		hide: function() {
			this.$el.removeClass( 'visible' );
			// .one() registers one callback for scroll and click independently
			// if one fired, get rid of the other one
			$( window ).off( '.drawer' );
			$( '#mw-mf-page-center' ).off( '.drawer' );
		},

		isVisible: function() {
			return this.$el.hasClass( 'visible' );
		}
	} );

M.define( 'Drawer', Drawer );

}( mw.mobileFrontend, jQuery ) );
