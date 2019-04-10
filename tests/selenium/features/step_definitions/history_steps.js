const assert = require( 'assert' ),
	{ ArticlePage, SpecialHistoryPage } = require( '../support/world' );

const iClickOnTheHistoryLinkInTheLastModifiedBar = () => {
	ArticlePage.last_modified_bar_history_link_element.waitForVisible();
	ArticlePage.last_modified_bar_history_link_element.click();
	assert.strictEqual( SpecialHistoryPage.side_list_element.isVisible(), true );
};

module.exports = {
	iClickOnTheHistoryLinkInTheLastModifiedBar
};
