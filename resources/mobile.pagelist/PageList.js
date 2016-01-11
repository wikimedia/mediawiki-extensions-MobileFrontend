( function ( M, $ ) {

	var View = M.require( 'mobile.view/View' ),
		browser = M.require( 'mobile.browser/browser' );

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
		 * @cfg {Boolean} defaults.imagesDisabled whether to show images or not.
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
			imagesDisabled: mw.config.get( 'wgImagesDisabled' ),
			pages: [],
			enhance: false
		},
		/**
		 * Render page images for the existing page list. Assumes no page images have been loaded.
		 * Only load when wgImagesDisabled has not been activated via Special:MobileOptions.
		 *
		 * @method
		 */
		renderPageImages: function () {
			var delay,
				self = this;

			if ( !this.options.imagesDisabled ) {
				// Delay an unnecessary load of images on mobile (slower?) connections
				// In particular on search results which can be regenerated quickly.
				delay = browser.isWideScreen() ? 0 : 1000;

				window.setTimeout( function () {
					self.$( '.list-thumb' ).each( function () {
						var style = $( this ).data( 'style' );
						$( this ).attr( 'style', style );
					} );
				}, delay );
			}
		},
		/**
		 * @inheritdoc
		 */
		postRender: function () {
			this.renderPageImages();
		},
		template: mw.template.get( 'mobile.pagelist', 'PageList.hogan' ),
		templatePartials: {
			item: mw.template.get( 'mobile.pagelist', 'PageListItem.hogan' )
		}
	} );

	M.define( 'mobile.pagelist/PageList', PageList );

}( mw.mobileFrontend, jQuery ) );
