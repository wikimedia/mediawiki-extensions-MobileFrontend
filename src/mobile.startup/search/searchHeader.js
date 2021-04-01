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
 * @return {jQuery.Element}
 */
function searchHeader( placeholderMsg, action, onInput, defaultSearchPage ) {
	return formHeader(
		new SearchHeaderView( {
			placeholderMsg,
			action,
			onInput,
			defaultSearchPage
		} ),
		[
			icons.cancel()
		],
		false
	);
}

module.exports = searchHeader;
