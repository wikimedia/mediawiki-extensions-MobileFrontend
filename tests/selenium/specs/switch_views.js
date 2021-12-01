'use strict';

const { ArticlePage } = require( '../features/support/world.js' );
const assert = require( 'assert' );

describe( 'Switch between views:', () => {

	it.skip( 'desktop to mobile', () => {
		ArticlePage.open( 'Main_Page' );
		ArticlePage.switch_to_mobile_element.click();
		ArticlePage.switch_to_desktop_element.waitForExist( 10000 );
		assert.true( ArticlePage.switch_to_desktop_element.isDisplayed(), 'I switched from desktop to mobile.' );
		ArticlePage.switch_to_desktop_element.click();
		ArticlePage.switch_to_mobile_element.waitForExist();
		assert.true( ArticlePage.switch_to_mobile_element.isDisplayed(), 'I switched from mobile to desktop.' );
	} );

} );
