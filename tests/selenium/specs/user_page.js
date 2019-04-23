const { iAmUsingTheMobileSite,
		iAmOnPage } = require( '../features/step_definitions/common_steps' ),
	Api = require( 'wdio-mediawiki/Api' ),
	Util = require( 'wdio-mediawiki/Util' ),
	RunJobs = require( 'wdio-mediawiki/RunJobs' ),
	UserLoginPage = require( 'wdio-mediawiki/LoginPage' ),
	{
		iShouldBeOnUserPage, thereShouldBeALinkToCreateMyUserPage
	} = require( '../features/step_definitions/user_page_steps' ),
	username = 'Selenium_user_' + Util.getTestString(),
	password = Util.getTestString();

// @chrome @firefox @test2.m.wikipedia.org @vagrant @login
describe( 'User:<username>', () => {

	before( () => {
		browser.deleteCookie();
		Api.createAccount( username, password );
		RunJobs.run();
		UserLoginPage.login( username, password );
	} );

	it( 'Check user page is editable', () => {
		iAmUsingTheMobileSite();
		iAmOnPage( `User:${username}` );
		iShouldBeOnUserPage( username );
		thereShouldBeALinkToCreateMyUserPage();
	} );
} );
