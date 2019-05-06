const { defineSupportCode } = require( 'cucumber' ),
	{
		pageExists,
		iAmUsingTheMobileSite,
		theTextOfTheFirstHeadingShouldContain,
		iAmLoggedIntoTheMobileWebsite,
		iAmOnPage
	} = require( './common_steps' ),
	{ iVisitMyUserPage, iShouldBeOnUserPage,
		thereShouldBeALinkToCreateMyUserPage
	} = require( './user_page_steps' ),
	{
		iClickOnTheHistoryLinkInTheLastModifiedBar
	} = require( './history_steps' );

const skip = () => {
	// eslint-disable-next-line no-console
	console.warn( 'skipped step' );
};
defineSupportCode( function ( { Then, When, Given } ) {
	Given( /^I am on the "(.+)" page$/, iAmOnPage );
	Given( /^I am on my contributions page$/, skip );
	Given( /^I am logged into the mobile website$/, iAmLoggedIntoTheMobileWebsite );
	Given( /^I visit my user page$/, iVisitMyUserPage );
	Given( /^the page "(.+)" exists$/, pageExists );
	Given( /^I am using the mobile site$/, iAmUsingTheMobileSite );
	Given( /^I am on a page that transcludes content from a special page$/, skip );
	Given( /^the page "Selenium diff test" exists and has at least "51" edits$/, skip );
	Given( /^I have recently edited pages on my watchlist$/, skip );
	Given( /^I am logged in as a new user$/, skip );
	Given( /^I am logged in as a user with a > 10 edit count$/, skip );
	When( /^my browser doesn't support JavaScript$/, skip );
	When( /^I toggle the mobile view$/, skip );
	When( /^I toggle the desktop view$/, skip );
	When( /^I should be on my user page$/, () => iShouldBeOnUserPage( browser.options.username ) );
	When( /^I switch to the list view of the watchlist$/, skip );
	When( /^I switch to the modified view of the watchlist$/, skip );
	When( /^I click the Pages tab$/, skip );
	When( /^I click on the history link in the last modified bar$/, iClickOnTheHistoryLinkInTheLastModifiedBar );
	When( /^I click the link in the header bar$/, skip );
	Then( /^there should be a link to create my user page$/, thereShouldBeALinkToCreateMyUserPage );
	Then( /^I should see the desktop view$/, skip );
	Then( /^I should see the mobile view$/, skip );
	Then( /^the a to z button should be selected$/, skip );
	Then( /^I should see a list of pages I am watching$/, skip );
	Then( /^the modified button should be selected$/, skip );
	Then( /^I should see a list of diff summary links$/, skip );
	Then( /^the Pages tab is selected$/, skip );
	Then( /^I am told there are no new changes$/, skip );
	Then( /^I am informed on how to add pages to my watchlist$/, skip );
	Then( /^I should see a more button$/, skip );
	Then( /^I should see a list of page contributions$/, skip );
	Then( /^I should see a summary of the last contribution$/, skip );
	Then( /^the last contribution summary should not show the title of the page edited$/, skip );
	Then( /^the last contribution summary should show the edit summary$/, skip );
	Then( /^the last contribution summary should show the time of the last edit$/, skip );
	Then( /^the text of the first heading should be "(.+)"$/, theTextOfTheFirstHeadingShouldContain );
	Then( /^the last contribution summary should show the username who made the last edit$/, skip );
	Then( /^the last contribution summary should show the title of the page edited$/, skip );
	Then( /^the last contribution summary should not show the username$/, skip );
} );
