var
	mfExtend = require( './mfExtend' ),
	Panel = require( './Panel' ),
	util = require( './util' ),
	Icon = require( './Icon' );

/**
 * A {@link View} that pops up from the bottom of the screen.
 * @class Drawer
 * @extends Panel
 * @param {Object} [props]
 */
function Drawer( props ) {
	Panel.call( this,
		util.extend(
			{ className: 'drawer position-fixed' },
			props,
			{ events: util.extend( { click: 'stopPropagation' }, ( props || {} ).events ) }
		)
	);
}

mfExtend( Drawer, Panel, {
	/**
	 * @memberof Drawer
	 * @instance
	 * @mixes Panel#defaults
	 * @property {Object} defaults Default options hash.
	 * @property {string} defaults.cancelButton HTML of the button that closes the drawer.
	 */
	defaults: util.extend( {}, Panel.prototype.defaults, {
		// Used by CtaDrawer, BlockMessage.
		collapseIcon: new Icon( {
			name: 'arrow',
			additionalClassNames: 'cancel'
		} ).options
	} ),
	/**
	 * @memberof Drawer
	 * @instance
	 */
	templatePartials: util.extend( {}, Panel.prototype.templatePartials, {
		icon: Icon.prototype.template
	} ),
	/**
	 * Defines an element that the Drawer should automatically be appended to.
	 * @memberof Drawer
	 * @instance
	 * @property {string}
	 */
	appendToElement: 'body',
	/**
	 * Whether the drawer should disappear on a scroll event
	 * @memberof Drawer
	 * @instance
	 * @property {boolean}
	 */
	closeOnScroll: true,

	/**
	 * @inheritdoc
	 * @memberof Drawer
	 * @instance
	 */
	postRender: function () {
		var self = this;
		// This module might be loaded at the top of the page e.g. Special:Uploads
		// Thus ensure we wait for the DOM to be loaded
		util.docReady( function () {
			self.appendTo( self.appendToElement );
			self.$el.parent().addClass( 'has-drawer' );
		} );
		this.on( 'show', this.onShowDrawer.bind( this ) );
		this.on( 'hide', this.onHideDrawer.bind( this ) );
	},
	/**
	 * Stop Propagation event handler
	 * @memberof Drawer
	 * @instance
	 * @param {Object} ev event object
	 * Allow the drawer itself to be clickable (e.g. for copying and pasting references
	 * clicking links in reference)
	 */
	stopPropagation: function ( ev ) {
		ev.stopPropagation();
	},

	/**
	 * ShowDrawer event handler
	 * @memberof Drawer
	 * @instance
	 */
	onShowDrawer: function () {
		var self = this;

		this.$el.parent().addClass( 'drawer-visible' );

		setTimeout( function () {
			var $window = util.getWindow();
			$window.one( 'click.drawer', self.hide.bind( self ) );
			if ( self.closeOnScroll ) {
				$window.one( 'scroll.drawer', self.hide.bind( self ) );
			}
		}, self.minHideDelay );
	},

	/**
	 * HideDrawer event handler
	 * @memberof Drawer
	 * @instance
	 */
	onHideDrawer: function () {
		this.$el.parent().removeClass( 'drawer-visible' );
		// .one() registers one callback for scroll and click independently
		// if one fired, get rid of the other one
		util.getWindow().off( '.drawer' );
	}
} );

module.exports = Drawer;
