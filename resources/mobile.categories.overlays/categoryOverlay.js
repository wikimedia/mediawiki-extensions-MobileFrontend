( function ( M ) {
	var Overlay = M.require( 'mobile.startup/Overlay' ),
		CategoryTabs = M.require( 'mobile.categories.overlays/CategoryTabs' );

	/**
	 * Gets an overlay for displaying categories
	 *
	 * @param {Object} options Configuration options
	 * @param {string} options.title of page to obtain categories for
	 * @param {mw.Api} options.api for usage in CategoryTabs
	 * @param {string} options.subheading for usage in CategoryTabs
	 * @param {OO.EventEmitter} options.eventBus Object used to listen for category-added
	 * and scroll:throttled events
	 * @return {Overlay}
	 */
	function categoryOverlay( options ) {
		var overlay, widget,
			headerButtons = options.isAnon ? [] :
				[ {
					href: '#/categories/add',
					className: 'add continue',
					msg: mw.msg( 'mobile-frontend-categories-add' )
				} ];
		overlay = new Overlay( {
			className: 'category-overlay overlay',
			heading: mw.msg( 'mobile-frontend-categories-heading' ),
			headerButtonsListClassName: 'header-action',
			headerButtons: headerButtons
		} );
		widget = new CategoryTabs(
			{
				eventBus: options.eventBus,
				api: options.api,
				title: options.title,
				subheading: mw.msg( 'mobile-frontend-categories-subheading' )
			}
		);
		overlay.$( '.overlay-content' ).append( widget.$el );
		return overlay;
	}
	M.define( 'mobile.categories.overlays/categoryOverlay', categoryOverlay ); // resource-modules-disable-line
	M.deprecate( 'mobile.categories.overlays/CategoryOverlay', categoryOverlay,
		'mobile.categories.overlays/categoryOverlay' );
}( mw.mobileFrontend ) );
