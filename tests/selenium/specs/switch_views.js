const { ArticlePage } = require( '../features/support/world.js' );

describe( 'Switch between views:', () => {

	it( 'desktop to mobile', () => {
		ArticlePage.open( 'Main_Page' );
		ArticlePage.setDesktopMode();
		ArticlePage.switch_to_mobile_element.click();

		ArticlePage.switch_to_desktop_element.waitForExist();
	} );

	it( 'mobile to desktop', () => {
		ArticlePage.open( 'Main_Page' );
		ArticlePage.setMobileMode();
		ArticlePage.switch_to_desktop_element.click();

		ArticlePage.switch_to_mobile_element.waitForExist();
	} );

} );
