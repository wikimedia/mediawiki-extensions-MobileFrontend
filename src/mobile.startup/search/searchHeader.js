const formHeader = require( '../headers' ).formHeader,
	SearchHeaderView = require( './SearchHeaderView' ),
	icons = require( '../icons' );

/**
 * Generate a search header
 *
 * @param {string} placeholderMsg
 * @param {string} action
 * @param {Function} onInput
 * @param {string} defaultSearchPage
 * @param {string} autocapitalize
 * @return {jQuery.Element}
 */
module.exports = function searchHeader( placeholderMsg, action, onInput, defaultSearchPage, autocapitalize ) {
	return formHeader(
		new SearchHeaderView( {
			placeholderMsg,
			autocapitalize,
			action,
			onInput,
			defaultSearchPage
		} ),
		[
			icons.cancel()
		],
		false
	);
};
