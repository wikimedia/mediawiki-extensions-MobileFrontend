const formHeader = require( '../headers' ).formHeader,
	SearchHeaderView = require( './SearchHeaderView' ),
	icons = require( '../icons' );

/**
 * Generate a search header
 * @param {string} placeholderMsg
 * @param {string} action
 * @param {Function} onInput
 * @return {JQuery.Element}
 */
function searchHeader( placeholderMsg, action, onInput ) {
	return formHeader(
		new SearchHeaderView( {
			placeholderMsg,
			action,
			onInput
		} ),
		[
			icons.cancel()
		],
		false
	);
}

module.exports = searchHeader;
