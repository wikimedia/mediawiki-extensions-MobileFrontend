/**
 * @class mw.mobileFrontend.settings
 * @singleton
 */
( function( M, $ ) {

M.settings = ( function() {
	var supportsLocalStorage;

	// using feature detection used by http://diveintohtml5.info/storage.html
	try {
		supportsLocalStorage = 'localStorage' in window && window.localStorage !== null;
	} catch ( e ) {
		supportsLocalStorage = false;
	}

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

	// FIXME: Deprecate - use $.cookie instead
	function writeCookie( name, value, days, path, domain ) {
		$.cookie( name, value, { path: path, expires: days, domain: domain } );
	}

	// FIXME: Deprecate - use $.cookie instead
	function readCookie( name ) {
		return $.cookie( name );
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
		return supportsLocalStorage ?
			localStorage.setItem( name, value ) :
				( useCookieFallback ? writeCookie( name, value, 1 ) : false );
	}

	/**
	 * Retrieves a user setting from a previous browser setting
	 *
	 * @param {String} name The key to refer to this value
	 * @param {Boolean} useCookieFallback Optional: When set this will use cookies when local storage not available.
	 * @returns {String|Boolean} Returns the associated value or False if nothing is found
	 */
	function getUserSetting( name, useCookieFallback ) {
		return supportsLocalStorage ? localStorage.getItem( name ) :
			( useCookieFallback ? readCookie( name ) : false );
	}

	return {
		getUserSetting: getUserSetting,
		readCookie: readCookie,
		saveUserSetting: saveUserSetting,
		supportsLocalStorage: supportsLocalStorage,
		writeCookie: writeCookie,
		cookiesEnabled: cookiesEnabled
	};
}());

}( mw.mobileFrontend, jQuery ) );
