var
	Overlay = require( '../mobile.startup/Overlay' ),
	Anchor = require( '../mobile.startup/Anchor' ),
	header = require( '../mobile.startup/headers' ).header,
	CategoryTabs = require( './CategoryTabs' );

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
	widget = new CategoryTabs(
		{
			eventBus: options.eventBus,
			api: options.api,
			title: options.title,
			subheading: mw.msg( 'mobile-frontend-categories-subheading' )
		}
	);
	overlay.$el.find( '.overlay-content' ).append( widget.$el );
	return overlay;
}

module.exports = categoryOverlay;
