var
	mfExtend = require( './mfExtend' ),
	View = require( './View' ),
	util = require( './util' ),
	Icon = require( './Icon' );

/**
 * A {@link View} that pops up from the bottom of the screen.
 *
 * @class Drawer
 * @extends View
 * @final
 * @param {Object} props
 * @param {string} [props.className] Additional CSS classes to add
 * @param {jQuery.Element[]} [props.children] An array of elements to append to
 * @param {Function} [props.onShow] Callback called before showing the drawer.
 *  It receives a promise given the show process is asynchronous.
 * @param {Function} [props.onBeforeHide] Callback called before hiding the drawer
 */
function Drawer( props ) {
	this.drawerClassName = props.className || '';
	this.collapseIcon = new Icon( {
		name: 'expand',
		additionalClassNames: 'cancel'
	} );
	View.call( this,
		util.extend(
			{
				onBeforeHide: () => {},
				showCollapseIcon: true
			},
			props,
			{
				className: 'drawer-container'
			},
			{ events: util.extend( {
				'click .drawer-container__mask': function () {
					this.hide();
				}.bind( this ),
				'click .cancel': function ( ev ) {
					ev.preventDefault();
					this.hide();
				}.bind( this ),
				click: function ( ev ) {
					ev.stopPropagation();
				}
			}, props.events ) }
		)
	);
}

mfExtend( Drawer, View, {
	// in milliseconds
	minHideDelay: 100,

	/**
	 * Shows panel after a slight delay
	 *
	 * @memberof View
	 * @instance
	 * @method
	 * @return {jQuery.Promise}
	 */
	show: function () {
		const d = util.Deferred();
		this.$el.find( '.drawer-container__mask' )
			.addClass( 'drawer-container__mask--visible' );
		if ( !this.$el.find( '.drawer' ).hasClass( 'visible' ) ) {
			// use setTimeout to allow the browser to redraw if render() was called
			// just before show(); this is important for animations to work
			// (0ms doesn't work on Firefox, 10ms is enough)
			//
			// FIXME: setTimeout should be reconsidered in T209129
			setTimeout( function () {
				this.$el.find( '.drawer' ).addClass( 'visible' );
				if ( this.options.onShow ) {
					this.options.onShow( d );
				}
				setTimeout( function () {
					d.resolve();
				}, this.minHideDelay );
			}.bind( this ), this.minHideDelay );
		} else {
			d.resolve();
		}
		return d.promise();
	},

	/**
	 * Hides panel
	 *
	 * @memberof View
	 * @instance
	 */
	hide: function () {
		this.$el.find( '.drawer-container__mask' )
			.removeClass( 'drawer-container__mask--visible' );
		this.$el.find( '.drawer' ).removeClass( 'visible' );
		// see comment in show()
		setTimeout( function () {
			this.$el.find( '.drawer' ).removeClass( 'visible' );
			this.options.onBeforeHide( this );
		}.bind( this ), this.minHideDelay );
	},

	/**
	 * @inheritdoc
	 * @memberof Drawer
	 * @instance
	 */
	postRender: function () {
		const props = this.options,
			$mask = util.parseHTML( '<div>' )
				.addClass( 'drawer-container__mask' ),
			// eslint-disable-next-line mediawiki/class-doc
			$drawer = util.parseHTML( '<div>' )
				.addClass( `drawer drawer-container__drawer position-fixed ${this.drawerClassName}`.trim() );

		if ( props.showCollapseIcon ) {
			// append the collapse icon at the top of the drawer
			$drawer.prepend( this.collapseIcon.$el );
		}

		if ( props.children ) {
			// append children
			$drawer.append( props.children );
		}
		this.$el.append( $mask );
		this.$el.append( $drawer );
	}
} );

module.exports = Drawer;
