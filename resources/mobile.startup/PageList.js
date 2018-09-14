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
		 * @memberof PageList
		 * @instance
		 * @mixes View#defaults
		 * @property {Object} defaults Default options hash.
		 * @property {Page[]} defaults.pages Array of Page objects. These should match
		 *                              the Page model and not necessarily the
		 *                              underlying API format used.
		 * E.g. [
		 *   {
		 *     heading: "<strong>C</strong>laude Monet",
		 *     id: undefined,
		 *     title: "Claude Monet",
		 *     displayTitle: "<i>Claude Monet</i>",
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
			pages: []
		},
		/**
		 * Render page images for the existing page list. Assumes no page images have been loaded.
		 * @memberof PageList
		 * @instance
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
		 * @memberof PageList
		 * @instance
		 */
		postRender: function () {
			this.renderPageImages();
		},
		template: mw.template.get( 'mobile.startup', 'PageList.hogan' ),
		/**
		 * @memberof PageList
		 * @instance
		 */
		templatePartials: {
			// The server uses a very different structure in
			// SpecialMobileEditWatchlist.getLineHtml(). Be aware of these differences
			// when updating server rendered items.
			item: mw.template.get( 'mobile.startup', 'PageListItem.hogan' )
		}
	} );

	M.define( 'mobile.startup/PageList', PageList );
}( mw.mobileFrontend ) );
