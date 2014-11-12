( function ( M, $, mw ) {

	var user = M.require( 'user' ),

		/**
		 * The `wikiGrokUser` object encapsulates the WikiGrok A/B test specific
		 * state of the user, e.g. whether or not they have seen WikiGrok while
		 * browsing anonymously, whereas the `user` object encapsulates their
		 * general state, e.g. their ID and name.
		 *
		 * @class wikiGrokUser
		 * @singleton
		 */
		wikiGrokUser = $.extend( {

			/**
			 * Gets the user's token from the "-wikiGrokUserToken" cookie. If the cookie
			 * isn't set, then a token is generated and then stored in the cookie for 90
			 * days, and then returned.
			 *
			 * @return {String}
			 */
			getToken: function () {
				var cookieName = mw.config.get( 'wgCookiePrefix' ) + '-wikiGrokUserToken',
					storedToken = $.cookie( cookieName ),
					generatedToken;

				if ( storedToken ) {
					return storedToken;
				}

				generatedToken = mw.user.generateRandomSessionId();

				$.cookie( cookieName, generatedToken, {
					expires: 90, // (days)
					path: '/'
				} );

				return generatedToken;
			}
		}, user );

	M.define( 'wikiGrokUser', wikiGrokUser );

} ( mw.mobileFrontend, jQuery, mw ) );
