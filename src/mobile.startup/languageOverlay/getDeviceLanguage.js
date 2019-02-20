/**
 * Return the language code of the device in lowercase
 *
 * @ignore
 * @param {window.navigator} navigator
 * @return {string|undefined}
 */
function getDeviceLanguage( navigator ) {
	const lang = navigator.languages ?
		navigator.languages[ 0 ] :
		navigator.language || navigator.userLanguage ||
				navigator.browserLanguage || navigator.systemLanguage;

	return lang ? lang.toLowerCase() : undefined;
}

module.exports = getDeviceLanguage;
