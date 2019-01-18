/**
 * Autosign a block of text if necessary
 * @instance
 * @param {string} text
 * @return {string} text with an autosign ("~~~~") if necessary
 */
function autosign( text ) {
	return /~{3,5}/.test( text ) ? text : text + ' ~~~~';
}

module.exports = autosign;
