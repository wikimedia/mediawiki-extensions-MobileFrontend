( function ( M, $ ) {
	var WatchList,
		PageList = M.require( 'modules/PageList' );

	/**
	 * An extension of the PageList which preloads pages as all being watched.
	 * @extends PageList
	 * @class WatchList
	 */
	WatchList = PageList.extend( {
		/**
		 * Retrieve pages where all pages are watched.
		 *
		 * @method
		 * @param {Array} ids a list of page ids
		 * @return jQuery.deferred
		 */
		getPages: function ( ids ) {
			return this.api.load( ids, true );
		},
		/**
		 * Also sets a watch uploads funnel.
		 * @inheritdoc
		 */
		postRender: function () {
			PageList.prototype.postRender.apply( this, arguments );
			this.$el.find( 'a.title' ).on( 'mousedown', function () {
				// name funnel for watchlists to catch subsequent uploads
				$.cookie( 'mwUploadsFunnel', 'watchlist', { expires: new Date( new Date().getTime() + 60000 ) } );
			} );
		}
	} );

	M.define( 'modules/watchlist/WatchList', WatchList );

}( mw.mobileFrontend, jQuery ) );
