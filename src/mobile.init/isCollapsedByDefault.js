const browser = require( '../mobile.startup/Browser' ).getSingleton();

/**
 * Checks if sections should be collapsed by default.
 *
 * @ignore
 *
 * @return {boolean}
 */
function isCollapsedByDefault() {
	return !browser.isWideScreen() &&
		// Section collapsing can be disabled in MobilePreferences
		!document.documentElement.classList.contains(
			'mf-expand-sections-clientpref-1'
		);
}

module.exports = isCollapsedByDefault;
