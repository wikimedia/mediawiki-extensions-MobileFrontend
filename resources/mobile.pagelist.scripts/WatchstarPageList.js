( function ( M, $ ) {

	var WatchstarPageList,
		mWatchstar,
		PageList = M.require( 'mobile.pagelist/PageList' ),
		Watchstar = M.require( 'mobile.watchstar/Watchstar' ),
		WatchstarApi = M.require( 'mobile.watchstar/WatchstarApi' ),
		user = M.require( 'mobile.user/user' ),
		Page = M.require( 'mobile.startup/Page' );

	/**
	 * List of items page view
	 * @class WatchstarPageList
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
		 */
		postRender: function () {
			var $li,
				self = this,
				pages = [],
				api = this.api;

			PageList.prototype.postRender.apply( this );

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
							funnel: self.options.funnel,
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

	mWatchstar = M.define( 'mobile.pagelist.scripts/WatchstarPageList', WatchstarPageList );

}( mw.mobileFrontend, jQuery ) );
