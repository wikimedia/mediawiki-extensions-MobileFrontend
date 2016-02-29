( function ( M, $ ) {
	var user, requestedClear;

	/**
	 * Utility library for looking up details on the current user
	 * @class user
	 * @singleton
	 */
	user = {
		/* @see mediaWiki.user */
		tokens: mw.user.tokens,
		/* @see mediaWiki.user */
		isAnon: mw.user.isAnon,
		/* @see mediaWiki.user */
		getName: mw.user.getName,
		/* @see mediaWiki.user */
		getId: mw.user.getId,
		/**
		 * Find current users edit count
		 * @method
		 * @returns {Number} the edit count of the current user on the current wiki.
		 */
		getEditCount: function () {
			return mw.config.get( 'wgUserEditCount' );
		},
		/**
		 * FIXME: Not sure why mw.user is asynchronous when the information is available
		 * For reasons I do not understand getGroups in core causes an unnecessary ajax request
		 * The information this returns is identical to the content of the config variable.
		 * To avoid an unnecessary ajax request on every page view simply use config variable.
		 */
		getGroups: function () {
			return $.Deferred().resolve( mw.config.get( 'wgUserGroups' ) );
		},
		/**
		* Wrapper for mw.user.sessionId().
		*
		* @method
		* @return {String}
		*/
		getSessionId: function () {
			// FIXME: Remove this when we're confident enough old IDs have been removed.
			if ( !requestedClear ) {
				requestedClear = true;
				mw.requestIdleCallback( function () {
					mw.storage.remove( 'sessionId' );
				} );
			}
			return mw.user.sessionId();
		},

		/**
		* User Bucketing for A/B testing
		* (we want this to be the same everywhere)
		* @return {Boolean}
		*/
		inUserBucketA: function () {
			return mw.config.get( 'wgUserId' ) % 2 === 0;
		}

	};
	M.define( 'mobile.user/user', user );

}( mw.mobileFrontend, jQuery ) );
