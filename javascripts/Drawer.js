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
		appendToElement: '#mw-mf-viewport',
		closeOnScroll: true,
		events: $.extend( {}, Panel.prototype.events, {
			click: 'stopPropagation'
		} ),

		/** @inheritdoc */
		postRender: function () {
			Panel.prototype.postRender.apply( this, arguments );
			this.on( 'show', $.proxy( this, 'onShowDrawer' ) );
			this.on( 'hide', $.proxy( this, 'onHideDrawer' ) );
		},
		/**
		 * Stop Propagation event handler
		 * @param {Object} ev event object
		 * Allow the drawer itself to be clickable (e.g. for copying and pasting references
		 * clicking links in reference)
		 */
		stopPropagation: function ( ev ) {
			ev.stopPropagation();
		},

		/**
		 * ShowDrawer event handler
		 */
		onShowDrawer: function () {
			var self = this;
			setTimeout( function () {
				$( 'body' ).one( 'click.drawer', $.proxy( self, 'hide' ) );
				if ( self.closeOnScroll ) {
					$( window ).one( 'scroll.drawer', $.proxy( self, 'hide' ) );
				}
				// can't use 'body' because the drawer will be closed when
				// tapping on it and clicks will be prevented
				$( '#mw-mf-page-center' ).one( 'click.drawer', $.proxy( self, 'hide' ) );
			}, self.minHideDelay );
		},

		/**
		 * HideDrawer event handler
		 */
		onHideDrawer: function () {
			// .one() registers one callback for scroll and click independently
			// if one fired, get rid of the other one
			$( window ).off( '.drawer' );
			$( '#mw-mf-page-center' ).off( '.drawer' );
		}
	} );

	M.define( 'Drawer', Drawer );

}( mw.mobileFrontend, jQuery ) );
