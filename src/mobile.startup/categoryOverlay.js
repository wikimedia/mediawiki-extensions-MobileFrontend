var
	Overlay = require( './Overlay' ),
	promisedView = require( './promisedView' ),
	Anchor = require( './Anchor' ),
	m = require( './moduleLoaderSingleton' ),
	header = require( './headers' ).header;

/**
 * Gets an overlay for displaying categories
 *
 * @param {Object} options Configuration options
 * @param {string} options.title of page to obtain categories for
 * @param {mw.Api} options.api for usage in CategoryTabs
 * @param {OO.EventEmitter} options.eventBus Object used to listen for category-added
 * and scroll:throttled events
 * @return {Overlay}
 */
function categoryOverlay( options ) {
	var overlay, widget;
	overlay = new Overlay( {
		className: 'category-overlay overlay',
		headers: [
			header(
				mw.msg( 'mobile-frontend-categories-heading' ),
				options.isAnon ? [] : [
					new Anchor( {
						href: '#/categories/add',
						label: mw.msg( 'mobile-frontend-categories-add' ),
						additionalClassNames: 'add continue'
					} )
				]
			)
		]
	} );

	widget = promisedView(
		mw.loader.using( 'mobile.categories.overlays' ).then( function () {
			var categories = m.require( 'mobile.categories.overlays' ),
				CategoryTabs = categories.CategoryTabs;

			return new CategoryTabs(
				{
					eventBus: options.eventBus,
					api: options.api,
					title: options.title
				}
			);
		} )
	);
	overlay.$el.find( '.overlay-content' ).append( widget.$el );
	return overlay;
}

module.exports = categoryOverlay;
