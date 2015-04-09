( function ( M, $ ) {

	var WatchstarPageList,
		PageList = M.require( 'PageList' ),
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
	WatchstarPageList = PageList.extend( {
		/**
		 * @inheritdoc
		 */
		initialize: function ( options ) {
			this.api = new WatchstarApi( options );
			PageList.prototype.initialize.apply( this, arguments );
		},
		/**
		 * @inheritdoc
		 */
		/*(template: mw.template.get( 'mobile.pagelist.scripts', 'PageList.hogan' ),
		templatePartials: {
			item: mw.template.get( 'mobile.pagelist.scripts', 'PageListItem.hogan' )
		},*/
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
		/**
		 * @inheritdoc
		 */
		postRender: function ( options ) {
			var $li,
				self = this,
				pages = [],
				api = this.api;

			PageList.prototype.postRender.apply( this, arguments );

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
							funnel: options.funnel,
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

	M.define( 'modules/WatchstarPageList', WatchstarPageList );
	// FIXME: Backwards compatability. Deprecated module, remove when unused.
	M.define( 'modules/PageList', WatchstarPageList );

}( mw.mobileFrontend, jQuery ) );
