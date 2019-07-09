/* global $ */

const
	PageHTMLParser = require( './PageHTMLParser' );

let pageHTMLParser;

/**
 * Constructs a page parser singleton specific to the current page to find common child elements
 * more easily.
 *
 * Because this depends on the presence of certain DOM elements, it
 * should only be called after the DOMContentLoaded event.
 *
 * @return {PageHTMLParser}
 */
function loadCurrentPageHTMLParser() {
	if ( pageHTMLParser ) {
		return pageHTMLParser;
	}

	pageHTMLParser = new PageHTMLParser( $( '#content #bodyContent' ) );

	return pageHTMLParser;
}

module.exports = loadCurrentPageHTMLParser;
