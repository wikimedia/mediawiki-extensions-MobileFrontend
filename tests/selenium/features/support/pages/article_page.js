/**
 * Represents a generic article page
 *
 * @extends MinervaPage
 * @example
 * https://en.m.wikipedia.org/wiki/Barack_Obama
 */

const MinervaPage = require( './minerva_page' );

class ArticlePage extends MinervaPage {

	get first_heading_element() { return $( '#section_0, .firstHeading' ); }
	get last_modified_bar_history_link_element() { return $( '.last-modifier-tagline a[href*=\'Special:History\']' ); }
	get switch_to_mobile_element() { return $( 'a=Mobile view' ); }
	get switch_to_desktop_element() { return $( 'a=Desktop' ); }

}

module.exports = new ArticlePage();
