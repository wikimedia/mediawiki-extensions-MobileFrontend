( function ( M, $ ) {
	var user,
		browser = M.require( 'browser' );

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
		* Retrieve and, if not present, generate a random session ID
		* (32 alphanumeric characters).
		* FIXME: use settings module
		*
		* @method
		* @return {String}
		*/
		getSessionId: function () {
			var sessionId;
			if ( !browser.supportsLocalStorage() ) {
				return '';
			}
			sessionId = localStorage.getItem( 'sessionId' );

			if ( !sessionId ) {
				sessionId = mw.user.generateRandomSessionId();
				localStorage.setItem( 'sessionId', sessionId );
			}
			return sessionId;
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
	M.define( 'user', user );

}( mw.mobileFrontend, jQuery ) );
