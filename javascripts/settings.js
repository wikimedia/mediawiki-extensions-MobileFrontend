/**
 * Helper library for managing user and device specific settings
 ** making use of localStorage and cookies as a fallback.
 * @class mw.mobileFrontend.settings
 * @singleton
 */
( function ( M, $ ) {

	M.settings = ( function () {

		function cookiesEnabled() {
			// If session cookie already set, return true
			if ( $.cookie( 'mf_testcookie' ) === 'test_value' ) {
				return true;
			// Otherwise try to set mf_testcookie and return true if it was set
			} else {
				$.cookie( 'mf_testcookie', 'test_value', { path: '/' } );
				return $.cookie( 'mf_testcookie' ) === 'test_value';
			}
		}

		/**
		 * Saves a user setting for a later browser settings via localStorage
		 *
		 * @param {String} name The key to refer to this value
		 * @param {String} value The value to store alongside the key
		 * @param {Boolean} useCookieFallback Optional: When set this will use cookies when local storage not available.
		 * @returns {Boolean} Whether the save was successful or not
		 */
		function saveUserSetting( name, value, useCookieFallback ) {
			return M.supportsLocalStorage ?
				localStorage.setItem( name, value ) :
					( useCookieFallback ? $.cookie( name, value, { expires: 1 } ) : false );
		}

		/**
		 * Retrieves a user setting from a previous browser setting
		 *
		 * @param {String} name The key to refer to this value
		 * @param {Boolean} useCookieFallback Optional: When set this will use cookies when local storage not available.
		 * @returns {String|Boolean} Returns the associated value or False if nothing is found
		 */
		function getUserSetting( name, useCookieFallback ) {
			return M.supportsLocalStorage ? localStorage.getItem( name ) :
				( useCookieFallback ? $.cookie( name ) : false );
		}

		/**
		 * Deletes a user setting from a previous browser setting
		 *
		 * @param {String} name The key to refer to this value
		 * @param {Boolean} useCookieFallback Optional: When set this will use cookies when local storage not available.
		 * @returns {Boolean} Whether the delete was successful or not
		 */
		function deleteUserSetting( name, useCookieFallback ) {
			return M.supportsLocalStorage ? localStorage.removeItem( name ) :
				( useCookieFallback ? $.removeCookie( name ) : false );
		}

		return {
			getUserSetting: getUserSetting,
			saveUserSetting: saveUserSetting,
			deleteUserSetting: deleteUserSetting,
			cookiesEnabled: cookiesEnabled
		};
	}() );

}( mw.mobileFrontend, jQuery ) );
