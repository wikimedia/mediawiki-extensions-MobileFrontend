const
	bannerUtil = require( './util' ),
	config = require( '../../../src/mobile.returnToApp/config.json' ),
	dom = require( '../utils/dom' ),
	jQuery = require( '../utils/jQuery' ),
	mediaWiki = require( '../utils/mw' ),
	sinon = require( 'sinon' );
let sandbox, returnToAppBanner;

// These user agents aren't intended to be exhaustive because we're testing
// cosmetic behavior.
const testUserAgents = {
	android: 'Mozilla/5.0 (Linux; Android 17) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.7977.84 Mobile Safari/537.36',
	ios: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1'
};
// Punctuation here is to test that URLs are escaped correctly. Using template
// strings for readability since we need to test single quotes, double quotes,
// and backslashes.
// eslint-disable-next-line quotes
const testIconConfig = { android: `/'android' \\ (icon)/ "url"`, ios: `/'ios' \\ (icon)/ "url"` };

QUnit.module( 'MobileFrontend returnToAppBanner.js', {
	beforeEach: function () {
		sandbox = sinon.createSandbox();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		config.MFReturnToAppBannerIcons = testIconConfig;
		returnToAppBanner = require( '../../../src/mobile.returnToApp/returnToAppBanner' );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( '#attachReturnToAppBanner, initial appearance', ( assert ) => {
	returnToAppBanner.attachReturnToAppBanner( 'test-url' );
	assert.strictEqual( document.querySelectorAll( '.mw-mf-return-to-app-banner' ).length, 1, 'A banner is added.' );

	returnToAppBanner.attachReturnToAppBanner( 'test-url' );
	assert.strictEqual( document.querySelectorAll( '.mw-mf-return-to-app-banner' ).length, 1, 'Multiple calls are idempotent.' );
} );

QUnit.test.each(
	'#attachReturnToAppBanner, app icon config is defined',
	[ 'android', 'ios' ],
	async ( assert, platform ) => {
		// window.navigator is marked as experimental in Node 24, but it seems
		// to work OK here.
		// eslint-disable-next-line n/no-unsupported-features/node-builtins
		Object.defineProperty( window.navigator, 'userAgent', { value: testUserAgents[platform] } );
		returnToAppBanner.attachReturnToAppBanner( 'test-url' );
		await bannerUtil.waitForBannerContent();

		const appIcon = document.querySelectorAll( '.mw-mf-return-to-app-icon' );

		assert.strictEqual( appIcon.length, 1, 'An app icon is added.' );
		assert.strictEqual( appIcon[0].getAttribute( 'alt' ), '', 'The app icon has empty alt text set.' );
		assert.strictEqual( appIcon[0].getAttribute( 'src' ), testIconConfig[platform], 'The correct config is used for the app icon source.' );
	} );

QUnit.test.each(
	'#attachReturnToAppBanner, app icon config is undefined for specific platform',
	[ 'android', 'ios' ],
	async ( assert, platform ) => {
		// window.navigator is marked as experimental in Node 24, but it seems
		// to work OK here.
		// eslint-disable-next-line n/no-unsupported-features/node-builtins
		Object.defineProperty( window.navigator, 'userAgent', { value: testUserAgents[platform] } );
		config.MFReturnToAppBannerIcons = { ...testIconConfig, [platform]: undefined };
		returnToAppBanner.attachReturnToAppBanner( 'test-url' );
		await bannerUtil.waitForBannerContent();
		assert.strictEqual( document.querySelectorAll( '.mw-mf-return-to-app-icon' ).length, 0, 'An app icon is not shown.' );
	} );

QUnit.test.each(
	'#attachReturnToAppBanner, app icon config is completely unset',
	[ 'android', 'ios' ],
	async ( assert, platform ) => {
		// window.navigator is marked as experimental in Node 24, but it seems
		// to work OK here.
		// eslint-disable-next-line n/no-unsupported-features/node-builtins
		Object.defineProperty( window.navigator, 'userAgent', { value: testUserAgents[platform] } );
		delete config.MFReturnToAppBannerIcons;
		returnToAppBanner.attachReturnToAppBanner( 'test-url' );
		await bannerUtil.waitForBannerContent();
		assert.strictEqual( document.querySelectorAll( '.mw-mf-return-to-app-icon' ).length, 0, 'An app icon is removed.' );
	} );

QUnit.test( '#attachReturnToAppBanner, following the link', async ( assert ) => {
	returnToAppBanner.attachReturnToAppBanner( 'test-url' );
	await bannerUtil.waitForBannerContent();

	const returnLink = document.querySelectorAll( 'a.mw-mf-return-to-app-link' );

	assert.strictEqual( returnLink.length, 1, 'A single link returning to the app is added.' );
	assert.strictEqual( returnLink[0].getAttribute( 'href' ), 'test-url', 'The link returning to the app has the URL passed.' );
	returnLink[0].dispatchEvent( new Event( 'click' ) );
	assert.strictEqual( document.querySelectorAll( '.mw-mf-return-to-app-banner' ).length, 0, 'Clicking the link removes the banner.' );
} );

QUnit.test( '#attachReturnToAppBanner, closing the banner', async ( assert ) => {
	returnToAppBanner.attachReturnToAppBanner( 'test-url' );
	await bannerUtil.waitForBannerContent();

	const closeButton = document.querySelectorAll( 'button.mw-mf-return-to-app-close' );

	assert.strictEqual( closeButton.length, 1, 'A single close button is added.' );
	closeButton[0].dispatchEvent( new Event( 'click' ) );
	assert.strictEqual( document.querySelectorAll( '.mw-mf-return-to-app-banner' ).length, 0, 'Clicking the close button removes the banner.' );
} );
