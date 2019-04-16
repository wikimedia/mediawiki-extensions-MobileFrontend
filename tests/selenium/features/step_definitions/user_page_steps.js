const assert = require( 'assert' );
const { iAmOnPage, theTextOfTheFirstHeadingShouldContain } = require( './common_steps' );
const UserPage = require( '../support/pages/user_page' );
const username = browser.options.username.replace( /_/g, ' ' );

const iVisitMyUserPage = () => {
	iAmOnPage( `User:${username}` );
};

const iShouldBeOnMyUserPage = () => {
	// note title of page may be username (Minerva skin) or User:<username> (other skins)
	theTextOfTheFirstHeadingShouldContain( username );
};

const thereShouldBeALinkToCreateMyUserPage = () => {
	assert.strictEqual( UserPage.user_link_element.isVisible(), true );
};

module.exports = { iVisitMyUserPage, iShouldBeOnMyUserPage,
	thereShouldBeALinkToCreateMyUserPage };
