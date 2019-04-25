const assert = require( 'assert' );
const { iAmOnPage, theTextOfTheFirstHeadingShouldContain } = require( './common_steps' );
const UserPage = require( '../support/pages/user_page' );
const USERNAME = browser.options.username;

const iVisitMyUserPage = () => {
	iAmOnPage( `User:${USERNAME}` );
};

const iShouldBeOnUserPage = ( username ) => {
	// note title of page may be username (Minerva skin) or User:<username> (other skins)
	theTextOfTheFirstHeadingShouldContain( ( username || USERNAME ).replace( /_/g, ' ' ) );
};

const thereShouldBeALinkToCreateMyUserPage = () => {
	assert.strictEqual( UserPage.user_link_element.isVisible(), true );
};

module.exports = { iVisitMyUserPage, iShouldBeOnUserPage,
	thereShouldBeALinkToCreateMyUserPage };
