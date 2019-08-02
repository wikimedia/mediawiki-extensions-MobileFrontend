/**
 * Represents a page the can be presented in desktop
 * or mobile mode (requires mobilefrontend), and has
 * features like public 'beta' mode (requires mobilefrontend).
 *
 * @extends Page
 * @example
 * https://en.m.wikipedia.org/wiki/Barack_Obama
 */

const { Page } = require( './mw_core_pages' );

class MinervaPage extends Page {

	get title() { return browser.getTitle(); }

	/**
	 * Opens a page if it isn't already open.
	 * @param {string} path
	 */
	open( path = 'Main_Page' ) {
		const currentPage = browser.getUrl(),
			newPage = browser.options.baseUrl + '/index.php?title=' + path;
		if ( currentPage !== newPage ) {
			browser.url( newPage );
		}
	}

	/**
	 * Ensure browser is opened on a MediaWiki page, and set a specified
	 * cookie for that domain. Refreshes the page after the cookie has been set.
	 * @param {string} name - name of the cookie
	 * @param {string} value - value of the cookie
	 */
	setCookie( name, value ) {
		const currentPage = browser.getUrl(),
			// some cookies might require a valid expiry date.
			// setting to 1 hour from now.
			cookieExpiryTime = new Date().getTime() + ( 3600 * 1000 );

		if ( !currentPage.includes( browser.options.baseUrl ) ) {
			this.open();
		}

		const cookie = browser.getCookie( name );

		if ( !cookie || cookie.value !== value ) {
			browser.setCookie( {
				name: name,
				value: value,
				expiry: cookieExpiryTime
			} );

			browser.refresh();
		}
	}

	/**
	 * Set the mobile cookie to true
	 */
	setMobileMode() {
		this.setCookie( 'mf_useformat', 'true' );
	}

	/**
	 * Set the mobile cookie to false
	 */
	setDesktopMode() {
		this.setCookie( 'mf_useformat', 'false' );
	}

	/**
	 * Set the beta cookie
	 */
	setBetaMode() {
		this.setCookie( 'optin', 'beta' );
	}

	waitUntilResourceLoaderModuleReady( moduleName ) {
		browser.waitUntil( () => {
			const state = browser.execute( ( m ) => {
				return mw.loader.getState( m );
			}, moduleName );
			return state.value === 'ready';
		} );
	}
}

module.exports = MinervaPage;
