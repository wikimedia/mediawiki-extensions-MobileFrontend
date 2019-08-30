const { ArticlePage } = require( '../features/support/world.js' );
const assert = require( 'assert' );

describe( 'Switch between views:', () => {

	it( 'desktop to mobile', () => {
		ArticlePage.open( 'Main_Page' );
		ArticlePage.switch_to_mobile_element.click();
		ArticlePage.switch_to_desktop_element.waitForExist( 10000 );
		assert.ok( ArticlePage.switch_to_desktop_element.isVisible(), 'I switched from desktop to mobile.' );
		ArticlePage.switch_to_desktop_element.click();
		ArticlePage.switch_to_mobile_element.waitForExist();
		assert.ok( ArticlePage.switch_to_mobile_element.isVisible(), 'I switched from mobile to desktop.' );
	} );

} );
