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
		// Note: Do not put the clear button inside the form
		// as hitting enter on the input element triggers a button click,
		// rather than submitting the form (see T136243)
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
