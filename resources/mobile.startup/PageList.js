( function ( M ) {

	var View = M.require( 'mobile.startup/View' ),
		browser = M.require( 'mobile.startup/Browser' ).getSingleton();

	/**
	 * List of items page view
	 * @class PageList
	 * @extends View
	 */
	function PageList() {
		View.apply( this, arguments );
	}

	OO.mfExtend( PageList, View, {
		/**
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {Page[]} defaults.pages Array of page objects returned from the server.
		 * E.g. [
		 *   {
		 *     heading: "<strong>C</strong>laude Monet",
		 *     id: undefined,
		 *     displayTitle: "Claude Monet",
		 *     url: "/wiki/Claude_Monet",
		 *     thumbnail: {
		 *       height: 62,
		 *       source: "http://127.0.0.1:8080/images/thumb/thumb.jpg",
		 *       width: 80,
		 *       isLandscape: true
		 *     }
		 *   }
		 * ]
		 */
		defaults: {
			pages: [],
			enhance: false
		},
		/**
		 * Render page images for the existing page list. Assumes no page images have been loaded.
		 *
		 * @method
		 */
		renderPageImages: function () {
			var self = this;

			setTimeout( function () {
				self.$( '.list-thumb' ).each( function () {
					var style = self.$( this ).data( 'style' );
					self.$( this ).attr( 'style', style );
				} );
			// Delay an unnecessary load of images on mobile (slower?) connections
			// In particular on search results which can be regenerated quickly.
			}, browser.isWideScreen() ? 0 : 1000 );
		},
		/**
		 * @inheritdoc
		 */
		postRender: function () {
			this.renderPageImages();
		},
		template: mw.template.get( 'mobile.startup', 'PageList.hogan' ),
		templatePartials: {
			item: mw.template.get( 'mobile.startup', 'PageListItem.hogan' )
		}
	} );

	M.define( 'mobile.startup/PageList', PageList )
		.deprecate( 'mobile.pagelist/PageList' );

}( mw.mobileFrontend ) );
