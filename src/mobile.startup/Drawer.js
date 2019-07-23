var
	mfExtend = require( './mfExtend' ),
	View = require( './View' ),
	util = require( './util' ),
	Icon = require( './Icon' );

/**
 * A {@link View} that pops up from the bottom of the screen.
 * @class Drawer
 * @extends View
 * @param {Object} [props]
 */
function Drawer( props ) {
	View.call( this,
		util.extend(
			{ className: 'drawer position-fixed' },
			props,
			{ events: util.extend( {
				'click .cancel': function ( ev ) {
					ev.preventDefault();
					this.hide();
				}.bind( this ),
				click: function ( ev ) {
					ev.stopPropagation();
				}
			}, ( props || {} ).events ) }
		)
	);
}

mfExtend( Drawer, View, {
	// in milliseconds
	minHideDelay: 10,

	/**
	 * Shows panel after a slight delay
	 * @memberof View
	 * @instance
	 * @method
	 */
	show: function () {
		var self = this;

		if ( !self.isVisible() ) {
			// use setTimeout to allow the browser to redraw if render() was called
			// just before show(); this is important for animations to work
			// (0ms doesn't work on Firefox, 10ms is enough)
			//
			// FIXME: setTimeout should be reconsidered in T209129
			setTimeout( function () {
				self.$el.addClass( 'visible animated' );
				self.emit( 'show' );
			}, self.minHideDelay );
		}
	},

	/**
	 * Hides panel
	 * @memberof View
	 * @instance
	 */
	hide: function () {
		var self = this;

		// see comment in show()
		setTimeout( function () {
			self.$el.removeClass( 'visible' );
			self.emit( 'hide' );
		}, self.minHideDelay );
	},

	/**
	 * Determines if panel is visible
	 * @memberof View
	 * @instance
	 * @return {boolean} View is visible
	 */
	isVisible: function () {
		return this.$el.hasClass( 'visible' );
	},

	/**
	 * Shows or hides panel
	 * @memberof View
	 * @instance
	 */
	toggle: function () {
		if ( this.isVisible() ) {
			this.hide();
		} else {
			this.show();
		}
	},

	/**
	 * @memberof Drawer
	 * @instance
	 * @mixes View#defaults
	 * @property {Object} defaults Default options hash.
	 * @property {Icon} defaults.collapseIcon
	 */
	defaults: util.extend( {}, View.prototype.defaults, {
		// Used by CtaDrawer, BlockMessage.
		collapseIcon: new Icon( {
			name: 'arrow',
			additionalClassNames: 'cancel'
		} )
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
		// append the collapse icon at the top of the drawer
		this.$el.prepend( this.options.collapseIcon.$el );
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
