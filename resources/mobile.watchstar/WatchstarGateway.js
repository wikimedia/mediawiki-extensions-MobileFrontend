( function ( M ) {
	var util = M.require( 'mobile.startup/util' );

	/**
	 * API for managing clickable watchstar
	 *
	 * @class WatchstarGateway
	 *
	 * @param {mw.Api} api
	 */
	function WatchstarGateway( api ) {
		this.api = api;
	}

	WatchstarGateway.prototype = {
		/**
		 * A map of page titles to watch statuses shared across all instances.
		 * Status is true if watched, false otherwise. Missing pages, i.e., pages
		 * whose IDs are unknown because they don't exist, are used in the case that
		 * a user wishes to observe when a page with a given title is created. Since
		 * all pages with IDs have titles, titles are unique within a given wiki,
		 * and it's possible for a title and page ID to conflict, only titles are
		 * used for the keys.
		 * @static {Object.<string, boolean>}
		 */
		_titleCache: {},

		/**
		 * Cache API response
		 * @memberof WatchstarGateway
		 * @instance
		 * @private
		 * @param {Object} resp Response from the server
		 */
		_loadIntoCache: function ( resp ) {
			var cache = this._titleCache;
			if ( resp.query && resp.query.pages ) {
				resp.query.pages.forEach( function ( page ) {
					cache[ page.title ] = page.watched;
				} );
			}
		},

		/**
		 * Update the watch status cache for a given list of page titles in bulk
		 * @memberof WatchstarGateway
		 * @instance
		 * @param {string[]} titles An array of page titles.
		 * @param {boolean} watched
		 * @return {void}
		 */
		populateWatchStatusCache: function ( titles, watched ) {
			var cache = this._titleCache;
			titles.forEach( function ( title ) {
				cache[ title ] = watched;
			} );
		},

		/**
		 * Loads the watch status for a given array of pages
		 * @memberof WatchstarGateway
		 * @instance
		 * @param {Object.<string,string|number>} titleToPageID A page title to page
		 *                                                      ID map. 0 indicates
		 *                                                      ID unknown.
		 * @return {jQuery.Deferred}
		 */
		loadWatchStatus: function ( titleToPageID ) {
			var self = this,
				titles = [],
				ids = [];

			// Partition titles and page IDs. Favor the later as they're shorter.
			Object.keys( titleToPageID )
				.forEach( function ( title ) {
					var id = titleToPageID[ title ];
					if ( id && id !== '0' ) {
						ids.push( id );
					} else if ( title ) {
						titles.push( title );
					}
				} );

			return this.loadWatchStatusByPageID( ids ).then( function () {
				return self.loadWatchStatusByPageTitle( titles );
			} );
		},

		/**
		 * Loads the watch status for a given list of page ids in bulk
		 * @memberof WatchstarGateway
		 * @instance
		 * @param {string[]} ids A list of page ids
		 * @return {jQuery.Deferred}
		 */
		loadWatchStatusByPageID: function ( ids ) {
			var self = this;

			if ( !ids.length ) { return util.Deferred().resolve(); }

			return this.api.get( {
				formatversion: 2,
				action: 'query',
				prop: 'info',
				inprop: 'watched',
				pageids: ids
			} ).then( function ( resp ) {
				self._loadIntoCache( resp );
			} );
		},

		/**
		 * Loads the watch status for a given list of page ids in bulk. Do not call
		 * call this method with more than ~2000 characters in titles.
		 * @memberof WatchstarGateway
		 * @instance
		 * @param {string[]} titles
		 * @return {jQuery.Deferred}
		 */
		loadWatchStatusByPageTitle: function ( titles ) {
			var self = this;

			if ( !titles.length ) { return util.Deferred().resolve(); }

			return this.api.get( {
				formatversion: 2,
				action: 'query',
				prop: 'info',
				inprop: 'watched',
				titles: titles
			} ).then( function ( resp ) {
				self._loadIntoCache( resp );
			} );
		},

		/**
		 * Marks whether a given page is watched or not to avoid an API call
		 * @memberof WatchstarGateway
		 * @instance
		 * @param {Page} page Page view object
		 * @param {boolean} isWatched True if page is watched
		 */
		setWatchedPage: function ( page, isWatched ) {
			this._titleCache[ page.getTitle() ] = isWatched;
		},

		/**
		 * Check if a given page is watched
		 * @memberof WatchstarGateway
		 * @instance
		 * @param {Page} page Page view object
		 * @return {boolean|undefined} undefined when the watch status is not known.
		 */
		isWatchedPage: function ( page ) {
			return this._titleCache[ page.getTitle() ];
		},

		/**
		 * Toggle the watch status of a known page
		 * @memberof WatchstarGateway
		 * @instance
		 * @param {Page} page Page view object
		 * @return {jQuery.Deferred}
		 */
		toggleStatus: function ( page ) {
			var data,
				self = this;

			data = {
				action: 'watch'
			};
			data.titles = [ page.getTitle() ];

			if ( this.isWatchedPage( page ) ) {
				data.unwatch = true;
			}
			return this.api.postWithToken( 'watch', data ).done( function () {
				var newStatus = !self.isWatchedPage( page );
				self.setWatchedPage( page, newStatus );
			} );
		}
	};

	M.define( 'mobile.watchstar/WatchstarGateway', WatchstarGateway );

}( mw.mobileFrontend ) );
