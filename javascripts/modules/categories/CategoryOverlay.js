( function ( M, $ ) {

	var CategoryOverlay,
		Overlay = M.require( 'Overlay' );

	/**
	 * Displays the list of categories for a page
	 * @class CategoryOverlay
	 * @extends Overlay
	 */
	CategoryOverlay = Overlay.extend( {
		defaults: {
			heading: mw.msg( 'mobile-frontend-categories-heading' ),
			subheading: mw.msg( 'mobile-frontend-categories-subheading' )
		},
		className: 'category-overlay overlay',
		templatePartials: {
			content: mw.template.get( 'mobile.categories', 'CategoryOverlay.hogan' ),
		},

		/**
		 * @inheritdoc
		 */
		initialize: function ( options ) {
			if ( options.categories.length === 0 ) {
				options.subheading = mw.msg( 'mobile-frontend-categories-nocat' );
			} else {
				options.items = [];

				// add categories to overlay
				$.each( options.categories, function ( index, category ) {
					var title = mw.Title.newFromText( category, 14 );
					options.items.push( {
						'url': title.getUrl(),
						'title': title.getName(),
					} );
				} );
			}
			Overlay.prototype.initialize.apply( this, arguments );
		}
	} );

	M.define( 'categories/CategoryOverlay', CategoryOverlay );

}( mw.mobileFrontend, jQuery ) );
