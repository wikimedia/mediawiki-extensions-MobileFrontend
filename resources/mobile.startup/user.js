( function ( M ) {
	var user,
		mwUser = mw.user,
		util = M.require( 'mobile.startup/util' );

	/**
	 * Utility library for looking up details on the current user
	 * @class user
	 * @singleton
	 */
	user = {
		/* @see mediaWiki.user */
		tokens: mwUser.tokens,
		/* @see mediaWiki.user */
		isAnon: mwUser.isAnon,
		/* @see mediaWiki.user */
		getName: mwUser.getName,
		/* @see mediaWiki.user */
		getId: mwUser.getId,
		/**
		 * Find current users edit count
		 * @method
		 * @return {number} the edit count of the current user on the current wiki.
		 */
		getEditCount: function () {
			return mw.config.get( 'wgUserEditCount' );
		},
		/**
		 * FIXME: Not sure why mw.user is asynchronous when the information is available
		 * For reasons I do not understand getGroups in core causes an unnecessary ajax request
		 * The information this returns is identical to the content of the config variable.
		 * To avoid an unnecessary ajax request on every page view simply use config variable.
		 *
		 * @return {jQuery.Deferred}
		 */
		getGroups: function () {
			return util.Deferred().resolve( mw.config.get( 'wgUserGroups' ) );
		},
		/**
		* Wrapper for mw.user.sessionId().
		*
		* @method
		* @return {string}
		*/
		getSessionId: function () {
			return mwUser.sessionId();
		},

		/**
		* User Bucketing for A/B testing
		* (we want this to be the same everywhere)
		* @return {boolean}
		*/
		inUserBucketA: function () {
			return mw.config.get( 'wgUserId' ) % 2 === 0;
		}

	};
	M.define( 'mobile.startup/user', user )
		.deprecate( 'mobile.user/user' );

}( mw.mobileFrontend ) );
