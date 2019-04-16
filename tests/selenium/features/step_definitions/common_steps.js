const assert = require( 'assert' ),
	Api = require( 'wdio-mediawiki/Api' ),
	{ ArticlePage, UserLoginPage, api } = require( '../support/world.js' );

const waitForPropagation = ( timeMs ) => {
	// wait 2 seconds so the change can propogate.
	const d = new Date();
	browser.waitUntil( () => new Date() - d > timeMs );
};

const theTextOfTheFirstHeadingShouldContain = ( title ) => {
	ArticlePage.first_heading_element.waitForVisible();
	assert.strictEqual(
		ArticlePage.first_heading_element.getText().indexOf( title ) > -1,
		true
	);
};

const login = () => {
	return api.loginGetEditToken( {
		username: browser.options.username,
		password: browser.options.password,
		apiUrl: `${browser.options.baseUrl}/api.php`
	} );
};

const createPages = ( pages ) => {
	const summary = 'edit by selenium test';
	return login().then( () =>
		api.batch(
			pages.map( ( page ) => [ 'create' ].concat( page ).concat( [ summary ] ) )
		)
	);
};

const createPage = ( title, wikitext ) => {
	return login().then( () => Api.edit( title, wikitext ) );
};

const iAmUsingTheMobileSite = () => {
	ArticlePage.setMobileMode();
};

const iAmOnPage = ( article ) => {
	ArticlePage.open( article );
	// Make sure the article opened and JS loaded.
	ArticlePage.waitUntilResourceLoaderModuleReady( 'mobile.init' );
};

const iAmLoggedIn = () => {
	UserLoginPage.open();
	UserLoginPage.loginAdmin();
	waitForPropagation( 5000 );
};

const iAmLoggedIntoTheMobileWebsite = () => {
	iAmUsingTheMobileSite();
	iAmLoggedIn();
};

const pageExists = ( title ) => {
	return createPage( title, 'Page created by Selenium browser test.' ).then( () => {
		const d = new Date();
		// wait 2 seconds so the change can propogate.
		browser.waitUntil( () => new Date() - d > 2000 );
	} );
};

module.exports = {
	theTextOfTheFirstHeadingShouldContain,
	waitForPropagation,
	createPage, createPages,
	pageExists,
	iAmLoggedIntoTheMobileWebsite,
	iAmUsingTheMobileSite,
	iAmLoggedIn, iAmOnPage
};
