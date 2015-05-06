( function ( M, $ ) {

	var Api = M.require( 'api' ).Api,
		WatchstarApi;

	/**
	 * API for managing clickable watchstar
	 *
	 * @class WatchstarApi
	 * @extends Api
	 */
	WatchstarApi = Api.extend( {
		_cache: {},

		/**
		 * Cache API response
		 * @method
		 * @private
		 * @param {Object} resp Response from the server
		 */
		_loadIntoCache: function ( resp ) {
			var self = this;
			if ( resp.query && resp.query.pages ) {
				$.each( resp.query.pages, function ( id ) {
					self._cache[ id ] = resp.query.pages[ id ].hasOwnProperty( 'watched' );
				} );
			}
		},
		/**
		 * Loads the watch status for a given list of page ids in bulk
		 * @method
		 * @param {Array} ids A list of page ids
		 * @param {Boolean} markAsAllWatched When true will assume all given ids are watched without a lookup.
		 * @return {jQuery.Deferred}
		 */
		load: function ( ids, markAsAllWatched ) {
			var self = this,
				result = $.Deferred();

			if ( markAsAllWatched ) {
				$.each( ids, function ( i, id ) {
					self._cache[ id ] = true;
				} );
				result.resolve();
			} else {
				this.get( {
					action: 'query',
					prop: 'info',
					inprop: 'watched',
					pageids: ids
				} ).done( function ( resp ) {
					self._loadIntoCache( resp );
					result.resolve();
				} );
			}
			return result;
		},

		/**
		 * Marks whether a given page is watched or not to avoid an API call
		 * @method
		 * @param {Page} page Page view object
		 * @param {Boolean} isWatched True if page is watched
		 */
		setWatchedPage: function ( page, isWatched ) {
			this._cache[ page.getId() ] = isWatched;
		},

		/**
		 * Check if a given page is watched
		 * @method
		 * @param {Page} page Page view object
		 * @return {Boolean}
		 * @throws {Error} when the status of the page has not been loaded.
		 */
		isWatchedPage: function ( page ) {
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
		 * @param {Page} page Page view object
		 * @return {jQuery.Deferred}
		 */
		toggleStatus: function ( page ) {
			var data,
				self = this,
				id = page.getId();

			data = {
				action: 'watch'
			};
			if ( id !== 0 ) {
				data.pageids = id;
			} else {
				// it's a new page use title instead
				data.title = page.getTitle();
			}

			if ( this.isWatchedPage( page ) ) {
				data.unwatch = true;
			}
			return this.postWithToken( 'watch', data ).done( function () {
				var newStatus = !self.isWatchedPage( page );
				self.setWatchedPage( page, newStatus );
				M.emit( 'watched', page, newStatus );
			} );
		}
	} );

	M.define( 'modules/watchstar/WatchstarApi', WatchstarApi );

}( mw.mobileFrontend, jQuery ) );
