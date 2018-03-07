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
	 * @extends View
	 *
	 * @constructor
	 * @param {Object} options Configuration options
	 */
	function WatchstarPageList( options ) {
		this.wsGateway = new WatchstarGateway( options.api );
		PageList.apply( this, arguments );
	}

	OO.mfExtend( WatchstarPageList, PageList, {
		/**
		 * @inheritdoc
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {mw.Api} defaults.api
		 */
		/**
		 * Retrieve pages
		 *
		 * @method
		 * @param {Array} ids a list of page ids
		 * @return {jQuery.Deferred}
		 */
		getPages: function ( ids ) {
			return this.wsGateway.loadWatchStatus( ids );
		},
		/**
		 * @inheritdoc
		 */
		postRender: function () {
			var $li,
				self = this,
				pages = [],
				gateway = this.wsGateway;

			PageList.prototype.postRender.apply( this );

			// Get the items that haven't been initialized
			$li = this.$( 'li:not(.with-watchstar)' );

			// Check what we have in the page list
			$li.each( function () {
				var id = self.$( this ).data( 'id' );
				if ( id ) {
					pages.push( id );
				}
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
								title: self.$( this ).attr( 'title' ),
								id: self.$( this ).data( 'id' )
							} );

						watchstar = new Watchstar( {
							api: self.options.api,
							funnel: self.options.funnel,
							isAnon: false,
							isWatched: gateway.isWatchedPage( page ),
							page: page,
							el: self.parseHTML( '<div>' ).appendTo( this )
						} );

						self.$( this ).addClass( 'with-watchstar' );

						/**
						 * @event watch
						 * Fired when an article in the PageList is watched.
						 */
						watchstar.on( 'watch', function () {
							self.emit( 'watch' );
						} );
						/**
						 * @event unwatch
						 * Fired when an article in the PageList is watched.
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
