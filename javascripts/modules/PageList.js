( function ( M, $ ) {

	var View = M.require( 'View' ),
		PageList,
		browser = M.require( 'browser' ),
		Watchstar = M.require( 'modules/watchstar/Watchstar' ),
		WatchstarApi = M.require( 'modules/watchstar/WatchstarApi' ),
		user = M.require( 'user' ),
		Page = M.require( 'Page' );

	/**
	 * List of items page view
	 * @class PageList
	 * @uses Page
	 * @uses WatchstarApi
	 * @uses Watchstar
	 * @extends View
	 */
	PageList = View.extend( {
		/**
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {Array} defaults.pages Array of page objects returned from the server.
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
		 * @cfg {Boolean} defaults.enhance Whether to enhance views already in DOM.
		 * When enabled, the template is disabled so that it is not rendered in the DOM.
		 * Use in conjunction with View::defaults.$el to associate the PageList with an existing
		 * already rendered element in the DOM.
		 */
		defaults: {
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
			var self = this,
				pages = {},
				$ul = this.$( '.page-list' ),
				delay = browser.isWideScreen() ? 0 : 1000;

			if ( !mw.config.get( 'wgImagesDisabled' ) ) {
				window.setTimeout( function () {
					$.each( self.options.pages, function ( i, page ) {
						var thumb;
						if ( page.thumbnail ) {
							thumb = page.thumbnail;
							page.listThumbStyleAttribute = 'background-image: url(' + thumb.source + ')';
							page.pageimageClass = thumb.width > thumb.height ? 'list-thumb-y' : 'list-thumb-x';
						} else {
							page.pageimageClass = 'list-thumb-none list-thumb-x';
						}
						pages[page.title] = page;
					} );

					// Render page images
					$ul.find( 'li' ).each( function () {
						var $li = $( this ),
							title = $li.attr( 'title' ),
							page = pages[title];

						if ( page ) {
							$li.find( '.list-thumb' ).addClass( page.pageimageClass )
								.attr( 'style', page.listThumbStyleAttribute );
						}
					} );
				}, delay );
			}
		},
		/**
		 * @inheritdoc
		 */
		initialize: function ( options ) {
			// FIXME: Find more elegant standard way to allow enhancement of views already in DOM
			if ( options.enhance ) {
				this.template = false;
			}

			this.api = new WatchstarApi( options );
			View.prototype.initialize.apply( this, arguments );
		},
		/**
		 * @inheritdoc
		 */
		template: mw.template.get( 'mobile.pagelist.scripts', 'PageList.hogan' ),
		templatePartials: {
			item: mw.template.get( 'mobile.pagelist.scripts', 'PageListItem.hogan' )
		},
		/**
		 * Retrieve pages
		 *
		 * @method
		 * @param {Array} ids a list of page ids
		 * @return {jQuery.Deferred}
		 */
		getPages: function ( ids ) {
			return this.api.load( ids );
		},
		/**
		 * @inheritdoc
		 * Loads watch stars for each page.
		 */
		postRender: function () {
			var $li,
				self = this,
				pages = [],
				api = this.api;

			View.prototype.postRender.apply( this, arguments );

			// Get the items that haven't been initialized
			$li = this.$( 'li:not(.with-watchstar)' );

			// Check what we have in the page list
			$li.each( function () {
				pages.push( $( this ).data( 'id' ) );
			} );

			// Create watch stars for each entry in list
			if ( !user.isAnon() && pages.length > 0 ) {
				// FIXME: This should be moved out of here so other extensions can override this behaviour.
				self.getPages( pages ).done( function () {
					$li.each( function () {
						var watchstar,
							page = new Page( {
								// FIXME: Set sections so we don't hit the api (hacky)
								sections: [],
								title: $( this ).attr( 'title' ),
								id: $( this ).data( 'id' )
							} );

						watchstar = new Watchstar( {
							isAnon: false,
							isWatched: api.isWatchedPage( page ),
							page: page,
							el: $( '<div>' ).appendTo( this )
						} );

						$( this ).addClass( 'with-watchstar' );

						/**
						 * @event watch
						 * Fired when an article in the PageList is watched.
						 */
						watchstar.on( 'watch', $.proxy( self, 'emit', 'watch' ) );
						/**
						 * @event unwatch
						 * Fired when an article in the PageList is watched.
						 */
						watchstar.on( 'unwatch', $.proxy( self, 'emit', 'unwatch' ) );
					} );
				} );
			}
		}
	} );

	M.define( 'modules/PageList', PageList );

}( mw.mobileFrontend, jQuery ) );
