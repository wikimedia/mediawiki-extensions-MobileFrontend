( function ( M, $ ) {

	var View = M.require( 'View' ),
		PageList,
		Watchstar = M.require( 'modules/watchstar/Watchstar' ),
		WatchstarApi = M.require( 'modules/watchstar/WatchstarApi' ),
		user = M.require( 'user' ),
		Page = M.require( 'Page' );

	/**
	 * Overlay that shows an editor
	 * @class PageList
	 * @uses Page
	 * @uses WatchstarApi
	 * @uses Watchstar
	 * @extends View
	 */
	PageList = View.extend( {
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
				delay = M.isWideScreen() ? 0 : 1000;

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
		 * @inheritDoc
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
		/**
		 * Retrieve pages
		 *
		 * @method
		 * @param {Array} ids a list of page ids
		 * @return jQuery.deferred
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
			$li = this.$( 'li' );

			// Check what we have in the page list
			$li.each( function () {
				pages.push( $( this ).data( 'id' ) );
			} );

			// Create watch stars for each entry in list
			if ( !user.isAnon() && pages.length > 0 ) {
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
