var
	Overlay = require( '../mobile.startup/Overlay' ),
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
	overlay.$el.find( '.overlay-content' ).append( widget.$el );
	return overlay;
}

module.exports = categoryOverlay;
