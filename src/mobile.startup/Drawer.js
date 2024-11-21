const
	View = require( './View' ),
	util = require( './util' ),
	IconButton = require( './IconButton' );

/**
 * A {@link View} that pops up from the bottom of the screen.
 *
 * @final
 */
class Drawer extends View {
	/**
	 * @param {Object} props
	 * @param {string} [props.className] Additional CSS classes to add
	 * @param {jQuery.Element[]} [props.children] An array of elements to append to
	 * @param {Function} [props.onShow] Callback called before showing the drawer.
	 *  It receives a promise given the show process is asynchronous. This is used in
	 *  production by GrowthExperiments.
	 * @param {Function} [props.onBeforeHide] Callback called before hiding the drawer
	 */
	constructor( props ) {
		super(
			util.extend(
				{
					onBeforeHide: () => {},
					showCollapseIcon: true
				},
				props,
				{ events: util.extend( {
					'click .drawer-container__mask': () => {
						this.hide();
					},
					'click .cancel': ( ev ) => {
						ev.preventDefault();
						this.hide();
					},
					click( ev ) {
						ev.stopPropagation();
					}
				}, props.events ) }
			)
		);
	}

	initialize( props ) {
		this.drawerClassName = props.className || '';
		props.className = 'drawer-container';
		this.collapseIcon = new IconButton( {
			icon: 'expand',
			additionalClassNames: 'cancel',
			label: mw.msg( 'mobile-frontend-drawer-arrow-label' )
		} );
		// in milliseconds
		this.minHideDelay = 100;
		super.initialize( props );
	}

	/**
	 * Shows panel after a slight delay
	 *
	 * @memberof module:mobile.startup/Drawer
	 * @instance
	 * @method
	 * @return {jQuery.Promise} which is used by GrowthExperiments
	 */
	show() {
		const d = util.Deferred();
		this.$el.prepend( this.$mask );
		// Force redraw by asking the browser to measure the element's width
		this.$el.width();
		const $drawer = this.$el.find( '.drawer' );
		this.$mask.addClass( 'drawer-container__mask--visible' );
		if ( !$drawer.hasClass( 'visible' ) ) {
			$drawer.addClass( 'visible' );
			// IntersectionObserver doesn't fire for content
			// in drawers, so trigger manually (T361212)
			mw.hook( 'mobileFrontend.loadLazyImages' ).fire( this.$el );
			if ( this.options.onShow ) {
				this.options.onShow( d );
			}
			requestAnimationFrame( () => d.resolve() );
		} else {
			d.resolve();
		}
		return d.promise();
	}

	/**
	 * Hides panel
	 */
	hide() {
		const $drawer = this.$el.find( '.drawer' );
		$drawer.removeClass( 'visible' );
		this.$mask.removeClass( 'drawer-container__mask--visible' );
		// Should really use 'transitionend' event here, but as the
		// parent $drawer element is often detatched as well, this
		// might not fire until the next show animation.
		setTimeout( () => {
			this.$mask.detach();
		}, 100 );
		requestAnimationFrame( () => {
			this.options.onBeforeHide( this );
		} );
	}

	/**
	 * @inheritdoc
	 */
	postRender() {
		this.$mask = util.parseHTML( '<div>' ).addClass( 'drawer-container__mask' );
		const props = this.options,
			// eslint-disable-next-line mediawiki/class-doc
			$drawer = util.parseHTML( '<div>' )
				.addClass( `drawer drawer-container__drawer position-fixed ${ this.drawerClassName }`.trim() );

		if ( props.showCollapseIcon ) {
			// append the collapse icon at the top of the drawer
			$drawer.prepend( this.collapseIcon.$el );
		}

		if ( props.children ) {
			// append children
			$drawer.append( props.children );
		}
		this.$el.append( $drawer );
	}
}

module.exports = Drawer;
