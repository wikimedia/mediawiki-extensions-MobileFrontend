( function( M, $ ) {

	var Api = M.require( 'api' ).Api,
		WatchstarApi;

	/**
	 * @class WatchstarApi
	 * @extends Api
	 */
	WatchstarApi = Api.extend( {
		_cache: {},

		_loadIntoCache: function( resp ) {
			var self = this;
			if ( resp.query && resp.query.pages ) {
				$.each( resp.query.pages, function( id ) {
					self._cache[ id ] = resp.query.pages[ id ].hasOwnProperty( 'watched' );
				} );
			}
		},
		/**
		 * Loads the watch status for a given list of page ids in bulk
		 * @method
		 * @param {array} ids A list of page ids
		 * @return {jQuery.Deferred}
		 */
		load: function( ids ) {
			var result = new $.Deferred(), self = this;
			this.get( {
				action: 'query',
				prop: 'info',
				inprop: 'watched',
				pageids: ids
			} ).done( function( resp ) {
				self._loadIntoCache( resp );
				result.resolve();
			} );
			return result;
		},

		/**
		 * Marks whether a given page is watched or not to avoid an API call
		 * @method
		 * @param {Page} page
		 * @param {Boolean} isWatched
		 */
		setWatchedPage: function( page, isWatched ) {
			this._cache[ page.getId() ] = isWatched;
		},

		/**
		 * Check if a given page is watched
		 * @method
		 * @param {Page} page
		 * @return {boolean}
		 * @throws Error when the status of the page has not been loaded.
		 */
		isWatchedPage: function( page ) {
			var id = page.getId();
			if ( this._cache.hasOwnProperty( id ) ) {
				return this._cache[id];
			} else {
				throw new Error( 'WatchstarApi unable to check watch status: Did you call load first?' );
			}
		},

		/**
		 * Toggle the watch status of a known page
		 * @method
		 * @param {Page} page
		 * @return {jQuery.Deferred}
		 */
		toggleStatus: function( page ) {
			var self = this, data;
			data = {
				action: 'watch',
				pageids: page.getId()
			};

			if ( this.isWatchedPage( page ) ) {
				data.unwatch = true;
			}
			return this.postWithToken( 'watch', data ).done( function() {
				var newStatus = !self.isWatchedPage( page );
				self.setWatchedPage( page, newStatus );
				M.emit( 'watched', page, newStatus );
			} );
		}
	} );

	M.define( 'modules/watchstar/WatchstarApi', WatchstarApi );

}( mw.mobileFrontend, jQuery ) );
