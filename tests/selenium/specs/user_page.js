const { iAmLoggedIntoTheMobileWebsite } = require( '../features/step_definitions/common_steps' ),
	{
		iVisitMyUserPage, iShouldBeOnMyUserPage, thereShouldBeALinkToCreateMyUserPage
	} = require( '../features/step_definitions/user_page_steps' );

// @chrome @firefox @test2.m.wikipedia.org @vagrant @login
describe( 'User:<username>', () => {

	beforeEach( () => {
		iAmLoggedIntoTheMobileWebsite();
		iVisitMyUserPage();
	} );

	it( 'Check user page is editable', () => {
		iShouldBeOnMyUserPage();
		thereShouldBeALinkToCreateMyUserPage();
	} );
} );
