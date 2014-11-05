( function ( M, $ ) {

	var Panel = M.require( 'Panel' ),
		Drawer;

	/**
	 * A {@link View} that pops up from the bottom of the screen.
	 * @class Drawer
	 * @extends Panel
	 */
	Drawer = Panel.extend( {
		className: 'drawer position-fixed',
		appendToElement: '#notifications',

		postRender: function () {
			var self = this;
			Panel.prototype.postRender.apply( this, arguments );
			this.on( 'show', function () {
				setTimeout( function () {
					$( 'body' ).one( 'click.drawer', $.proxy( self, 'hide' ) );
					$( window ).one( 'scroll.drawer', $.proxy( self, 'hide' ) );
					// can't use 'body' because the drawer will be closed when
					// tapping on it and clicks will be prevented
					$( '#mw-mf-page-center' ).one( 'click.drawer', $.proxy( self, 'hide' ) );
				}, self.minHideDelay );
			} );

			this.on( 'hide', function () {
				// .one() registers one callback for scroll and click independently
				// if one fired, get rid of the other one
				$( window ).off( '.drawer' );
				$( '#mw-mf-page-center' ).off( '.drawer' );
			} );

			// Allow the drawer itself to be clickable (e.g. for copying and pasting references / clicking links in reference)
			this.$el.on( 'click', function ( ev ) {
				ev.stopPropagation();
			} );
		}
	} );

	M.define( 'Drawer', Drawer );

}( mw.mobileFrontend, jQuery ) );
