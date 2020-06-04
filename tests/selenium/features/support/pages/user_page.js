/**
 * Represents a generic article page
 *
 * @extends MinervaPage
 * @example
 * https://en.m.wikipedia.org/wiki/Barack_Obama
 */

'use strict';

const MinervaPage = require( './minerva_page' );

class UserPage extends MinervaPage {

	get user_link_element() { return $( '.edit-link' ); }
}

module.exports = new UserPage();
