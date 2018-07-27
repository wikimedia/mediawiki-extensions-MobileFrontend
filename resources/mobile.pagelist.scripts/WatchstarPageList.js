( function ( M ) {

	var PageList = M.require( 'mobile.startup/PageList' ),
		Watchstar = M.require( 'mobile.watchstar/Watchstar' ),
		user = M.require( 'mobile.startup/user' ),
		Page = M.require( 'mobile.startup/Page' ),
		WatchstarGateway = M.require( 'mobile.watchstar/WatchstarGateway' );

	/**
	 * List of items page view
	 * @class WatchstarPageList
	 * @uses Page
	 * @uses WatchstarGateway
	 * @uses Watchstar
	 * @extends PageList
	 *
	 * @fires WatchstarPageList#unwatch
	 * @fires WatchstarPageList#watch
	 * @param {Object} options Configuration options
	 */
	function WatchstarPageList( options ) {
		this.wsGateway = new WatchstarGateway( options.api );
		PageList.apply( this, arguments );
	}

	OO.mfExtend( WatchstarPageList, PageList, {
		/**
		 * @memberof WatchstarPageList
		 * @instance
		 * @mixes PageList#defaults
		 * @property {Object} defaults Default options hash.
		 * @property {mw.Api} defaults.api
		 */
		/**
		 * Retrieve pages
		 *
		 * @memberof WatchstarPageList
		 * @instance
		 * @param {Object.<string,string|number>} titleToPageID A page title to page
		 *                                                      ID map. 0 indicates
		 *                                                      ID unknown.
		 * @return {jQuery.Deferred}
		 */
		getPages: function ( titleToPageID ) {
			return this.wsGateway.loadWatchStatus( titleToPageID );
		},
		/**
		 * @inheritdoc
		 * @memberof WatchstarPageList
		 * @instance
		 */
		postRender: function () {
			var $li,
				self = this,
				titleToPageID = {},
				gateway = this.wsGateway;

			PageList.prototype.postRender.apply( this );

			// Get the items that haven't been initialized
			$li = this.$( 'li:not(.with-watchstar)' );

			// Check what we have in the page list
			$li.each( function () {
				var li = self.$( this );
				titleToPageID[ li.attr( 'title' ) ] = li.data( 'id' );
			} );

			// Create watch stars for each entry in list
			if ( !user.isAnon() && Object.keys( titleToPageID ).length ) {
				// FIXME: This should be moved out of here so other extensions can override this behaviour.
				self.getPages( titleToPageID ).then( function () {
					$li.each( function () {
						var watchstar,
							page = new Page( {
								// FIXME: Set sections so we don't hit the api (hacky)
								sections: [],
								title: self.$( this ).attr( 'title' ),
								id: self.$( this ).data( 'id' )
							} );

						watchstar = new Watchstar( {
							api: self.options.api,
							funnel: self.options.funnel,
							isAnon: false,
							// WatchstarPageList.getPages() already retrieved the status of
							// each page. Explicitly set the watch state so another request
							// will not be issued by the Watchstar.
							isWatched: gateway.isWatchedPage( page ),
							page: page,
							el: self.parseHTML( '<div>' ).appendTo( this )
						} );

						self.$( this ).addClass( 'with-watchstar' );

						/**
						 * Fired when an article in the PageList is watched.
						 * @event WatchstarPageList#watch
						 */
						watchstar.on( 'watch', function () {
							self.emit( 'watch' );
						} );
						/**
						 * Fired when an article in the PageList is unwatched.
						 * @event WatchstarPageList#unwatch
						 */
						watchstar.on( 'unwatch', function () {
							self.emit( 'unwatch' );
						} );
					} );
				} );
			}
		}
	} );

	M.define( 'mobile.pagelist.scripts/WatchstarPageList', WatchstarPageList );

}( mw.mobileFrontend ) );
