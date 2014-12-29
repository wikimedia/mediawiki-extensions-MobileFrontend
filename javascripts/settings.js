/**
 * Helper library for managing user and device specific settings
 * that makes use of localStorage and cookies as a fallback.
 * @class mw.mobileFrontend.settings
 * @singleton
 */
( function ( M, $ ) {

	var browser = M.require( 'browser' ),
		supportsLocalStorage = browser.supportsLocalStorage(),
		settings = ( function () {
			/**
			 * Checks whether cookies are enabled
			 * @method
			 * @returns {Boolean} Whether cookies are enabled
			 */
			function cookiesEnabled() {
				// If session cookie already set, return true
				if ( $.cookie( 'mf_testcookie' ) === 'test_value' ) {
					return true;
				// Otherwise try to set mf_testcookie and return true if it was set
				} else {
					$.cookie( 'mf_testcookie', 'test_value', {
						path: '/'
					} );
					return $.cookie( 'mf_testcookie' ) === 'test_value';
				}
			}

			/**
			 * Saves a user setting for a later browser settings via localStorage
			 * @method
			 * @param {String} name The key to refer to this value
			 * @param {String} value The value to store alongside the key
			 * @param {Boolean} useCookieFallback Optional: When set this will use
			 * cookies when local storage not available.
			 * @returns {Boolean} Whether the save was successful or not
			 */
			function save( name, value, useCookieFallback ) {
				var cookieOptions = {
					expires: 1
				};
				return supportsLocalStorage ?
					localStorage.setItem( name, value ) :
						( useCookieFallback ? $.cookie( name, value, cookieOptions ) : false );
			}

			/**
			 * Retrieves a user setting from a previous browser setting
			 * @method
			 * @param {String} name The key to refer to this value
			 * @param {Boolean} useCookieFallback Optional: When set this will use cookies
			 * when local storage not available.
			 * @returns {String|Boolean} Returns the associated value or False if nothing
			 * is found
			 */
			function get( name, useCookieFallback ) {
				return supportsLocalStorage ? localStorage.getItem( name ) :
					( useCookieFallback ? $.cookie( name ) : false );
			}

			/**
			 * Deletes a user setting from a previous browser setting
			 * @method
			 * @param {String} name The key to refer to this value
			 * @param {Boolean} useCookieFallback Optional: When set this will use cookies
			 * when local storage not available.
			 * @returns {Boolean} Whether the delete was successful or not
			 */
			function remove( name, useCookieFallback ) {
				return supportsLocalStorage ? localStorage.removeItem( name ) :
					( useCookieFallback ? $.removeCookie( name ) : false );
			}

			return {
				get: get,
				save: save,
				remove: remove,
				cookiesEnabled: cookiesEnabled
			};
		}() );

	M.define( 'settings', settings );

}( mw.mobileFrontend, jQuery ) );
