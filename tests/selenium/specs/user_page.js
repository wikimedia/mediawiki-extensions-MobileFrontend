const { iAmUsingTheMobileSite,
		iAmOnPage } = require( '../features/step_definitions/common_steps' ),
	Api = require( 'wdio-mediawiki/Api' ),
	Util = require( 'wdio-mediawiki/Util' ),
	assert = require( 'assert' ),
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
		const login = () => {
			RunJobs.run();
			UserLoginPage.login( username, password );
		};

		browser.deleteCookie();
		browser.call( function () {
			return Api.createAccount( username, password )
				// in case of token error try again
				.catch( () => {
					return Api.createAccount( username, password )
						.then( login )
						.catch( () => {
							assert.ok( false, 'Problem creating account for test (tried two times)' );
						} );
				} );
		} );
		login();
	} );

	it( 'Check user page is editable', () => {
		iAmUsingTheMobileSite();
		iAmOnPage( `User:${username}` );
		iShouldBeOnUserPage( username );
		thereShouldBeALinkToCreateMyUserPage();
	} );
} );
