var
	mfExtend = require( './mfExtend' ),
	View = require( './View' ),
	util = require( './util' ),
	Icon = require( './Icon' ),
	collapseIcon = new Icon( {
		name: 'expand',
		additionalClassNames: 'cancel'
	} );

/**
 * A {@link View} that pops up from the bottom of the screen.
 * @class Drawer
 * @extends View
 * @final
 * @param {Object} [props]
 * @param {string} [props.className] Additional CSS classes to add
 * @param {JQuery.Element[]} [props.children] An array of elements to append to
 * @param {Function} [props.onBeforeHide] Callback called before hiding the drawer
 * @param {boolean} [props.closeOnScroll] Whether the drawer should disappear on a scroll event
 * the drawer.
 */
function Drawer( props ) {
	View.call( this,
		util.extend(
			{
				closeOnScroll: true,
				onBeforeHide: () => {},
				showCollapseIcon: true
			},
			props,
			{ className: `drawer position-fixed ${props && props.className || ''}`.trim() },
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
	 * @return {JQuery.Promise}
	 */
	show: function () {
		const d = util.Deferred();
		if ( !this.isVisible() ) {
			// use setTimeout to allow the browser to redraw if render() was called
			// just before show(); this is important for animations to work
			// (0ms doesn't work on Firefox, 10ms is enough)
			//
			// FIXME: setTimeout should be reconsidered in T209129
			setTimeout( function () {
				this.$el.addClass( 'visible animated' );
				const closeOnScroll = this.options.closeOnScroll;
				this.$el.parent().addClass( `drawer-visible${closeOnScroll ? '' : ' has-drawer--with-scroll-locked'}` );

				setTimeout( function () {
					var $window = util.getWindow();
					$window.one( 'click.drawer', this.hide.bind( this ) );
					if ( closeOnScroll ) {
						$window.one( 'scroll.drawer', this.hide.bind( this ) );
					}
					d.resolve();
				}.bind( this ), this.minHideDelay );
			}.bind( this ), this.minHideDelay );
		} else {
			d.resolve();
		}
		return d.promise();
	},

	/**
	 * Hides panel
	 * @memberof View
	 * @instance
	 */
	hide: function () {
		// see comment in show()
		setTimeout( function () {
			this.$el.removeClass( 'visible' );
			this.options.onBeforeHide();
			this.$el.parent().removeClass( 'drawer-visible has-drawer--with-scroll-locked' );
			// .one() registers one callback for scroll and click independently
			// if one fired, get rid of the other one
			util.getWindow().off( '.drawer' );
		}.bind( this ), this.minHideDelay );
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
	 * Defines an element that the Drawer should automatically be appended to.
	 * @memberof Drawer
	 * @instance
	 * @property {string}
	 */
	appendToElement: 'body',

	/**
	 * @inheritdoc
	 * @memberof Drawer
	 * @instance
	 */
	postRender: function () {

		if ( this.options.showCollapseIcon ) {
			// append the collapse icon at the top of the drawer
			this.$el.prepend( collapseIcon.$el );
		}

		if ( this.options.children ) {
			// append children
			this.$el.append( this.options.children );
		}

		// This module might be loaded at the top of the page e.g. Special:Uploads
		// Thus ensure we wait for the DOM to be loaded
		util.docReady( function () {
			this.appendTo( this.appendToElement );
			this.$el.parent().addClass( 'has-drawer' );
		}.bind( this ) );
	}
} );

module.exports = Drawer;
