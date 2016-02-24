( function ( M, mw, $ ) {
	/**
	 * Coordinates the logging of MobileWebSchema events.
	 * Implements schema defined at https://meta.wikimedia.org/wiki/Schema:MobileWebSearch
	 *
	 * @class
	 */
	function MobileWebSearchLogger() {
		this.userSessionToken = null;
		this.searchSessionToken = null;
	}

	MobileWebSearchLogger.prototype = {
		/**
		 * Sets the internal state required to deal with logging user session
		 * data.
		 *
		 * @private
		 */
		_newUserSession: function () {
			this.userSessionToken = mw.user.generateRandomSessionId();
		},

		/**
		 * Sets the internal state required to deal with logging search session
		 * data.
		 *
		 * @private
		 */
		_newSearchSession: function () {
			this.searchSessionToken = mw.user.generateRandomSessionId();
			this.searchSessionCreatedAt = new Date().getTime();
		},

		/**
		 * Handles the 'search-show' event.
		 */
		onSearchShow: function () {
			this._newUserSession();
		},

		/**
		 * Handles the 'search-start' event.
		 */
		onSearchStart: function () {
			this._newSearchSession();
			mw.track( 'mf.schemaMobileWebSearch', {
				action: 'session-start',
				userSessionToken: this.userSessionToken,
				searchSessionToken: this.searchSessionToken,
				timeOffsetSinceStart: 0
			} );
		},

		/**
		 * Handles the 'search-results' event.
		 *
		 * @param {Object} event with property {Object[]} event.results
		 */
		onSearchResults: function ( event ) {
			var timeOffsetSinceStart =
				new Date().getTime() - this.searchSessionCreatedAt;

			mw.track( 'mf.schemaMobileWebSearch', {
				action: 'impression-results',
				resultSetType: 'prefix',
				numberOfResults: event.results.length,
				userSessionToken: this.userSessionToken,
				searchSessionToken: this.searchSessionToken,
				// FIXME: Unless I'm mistaken, the timeToDisplayResults
				// property isn't necessary.
				timeToDisplayResults: timeOffsetSinceStart,
				timeOffsetSinceStart: timeOffsetSinceStart
			} );
		},

		/**
		 * Handles the 'search-result-click' event.
		 *
		 * @param {Object} event with property {Number} event.index The zero-based index of the result in the
		 *  set of results
		 */
		onSearchResultClick: function ( event ) {
			var timeOffsetSinceStart =
				new Date().getTime() - this.searchSessionCreatedAt;

			mw.track( 'mf.schemaMobileWebSearch', {
				action: 'click-result',
				// NOTE: clickIndex is 1-based.
				clickIndex: event.resultIndex + 1,
				userSessionToken: this.userSessionToken,
				searchSessionToken: this.searchSessionToken,
				timeOffsetSinceStart: timeOffsetSinceStart
			} );
		}
	};

	/**
	 * Convenience function that wires up an instance of the
	 * MobileWebSearchLogger class to the search-* events emitted by the
	 * search overlay.
	 */
	MobileWebSearchLogger.register = function () {
		var logger = new MobileWebSearchLogger();

		$.each( {
			'search-show': logger.onSearchShow,
			'search-start': logger.onSearchStart,
			'search-results': logger.onSearchResults,
			'search-result-click': logger.onSearchResultClick
		}, function ( eventName, handler ) {
			M.on( eventName, $.proxy( handler, logger ) );
		} );
	};

	M.define( 'mobile.search/MobileWebSearchLogger', MobileWebSearchLogger );

}( mw.mobileFrontend, mw, jQuery ) );
