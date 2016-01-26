( function ( M, $ ) {

	var Panel = M.require( 'mobile.startup/Panel' ),
		Icon = M.require( 'mobile.startup/Icon' );

	/**
	 * A {@link View} that pops up from the bottom of the screen.
	 * @class Drawer
	 * @extends Panel
	 */
	function Drawer() {
		Panel.apply( this, arguments );
	}

	OO.mfExtend( Drawer, Panel, {
		/**
		 * @inheritdoc
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {String} defaults.cancelButton HTML of the button that closes the drawer.
		 */
		defaults: $.extend( {}, Panel.prototype.defaults, {
			cancelButton: new Icon( {
				tagName: 'a',
				name: 'close-invert',
				additionalClassNames: 'cancel',
				label: mw.msg( 'mobile-frontend-overlay-close' )
			} ).toHtmlString()
		} ),
		className: 'drawer position-fixed',
		/**
		 * Defines an element that the Drawer should automatically be appended to.
		 * @property {String}
		 */
		appendToElement: 'body',
		/**
		 * Whether the drawer should disappear on a scroll event
		 * @property {Boolean}
		 */
		closeOnScroll: true,
		events: $.extend( {}, Panel.prototype.events, {
			click: 'stopPropagation'
		} ),

		/** @inheritdoc */
		postRender: function () {
			var self = this;
			// This module might be loaded at the top of the page e.g. Special:Uploads
			// Thus ensure we wait for the DOM to be loaded
			$( function () {
				self.appendTo( self.appendToElement );
			} );
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
			var self = this,
				$window = $( window );
			setTimeout( function () {
				$window.one( 'click.drawer', $.proxy( self, 'hide' ) );
				if ( self.closeOnScroll ) {
					$window.one( 'scroll.drawer', $.proxy( self, 'hide' ) );
				}
			}, self.minHideDelay );
		},

		/**
		 * HideDrawer event handler
		 */
		onHideDrawer: function () {
			// .one() registers one callback for scroll and click independently
			// if one fired, get rid of the other one
			$( window ).off( '.drawer' );
		}
	} );

	M.define( 'mobile.drawers/Drawer', Drawer );

}( mw.mobileFrontend, jQuery ) );
