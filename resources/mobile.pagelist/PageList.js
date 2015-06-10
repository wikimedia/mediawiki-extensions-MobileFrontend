( function ( M, $ ) {

	var PageList,
		View = M.require( 'View' ),
		browser = M.require( 'browser' );

	/**
	 * List of items page view
	 * @class PageList
	 * @extends View
	 */
	PageList = View.extend( {
		/**
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {Boolean} defaults.imagesDisabled whether to show images or not.
		 * @cfg {Page[]} defaults.pages Array of page objects returned from the server.
		 * E.g. [
		 *   {
		 *     heading: "<strong>C</strong>laude Monet",
		 *     id: undefined,
		 *     listThumbStyleAttribute: "background-image: url(http://127.0.0.1:8080/images/thumb/thumb.jpg)",
		 *     pageimageClass: "list-thumb-y",
		 *     title: "Claude Monet",
		 *     url: "/wiki/Claude_Monet",
		 *     thumbnail: {
		 *       height: 62,
		 *       source: "http://127.0.0.1:8080/images/thumb/thumb.jpg",
		 *       width: 80
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
			if ( !this.options.imagesDisabled ) {
				var $ul = this.$( '.page-list' ),
					// Delay an unnecessary load of images on mobile (slower?) connections
					// In particular on search results which can be regenerated quickly.
					delay = browser.isWideScreen() ? 0 : 1000;

				window.setTimeout( function () {
					$ul.find( '.list-thumb' ).each( function () {
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

	M.define( 'PageList', PageList );

}( mw.mobileFrontend, jQuery ) );
