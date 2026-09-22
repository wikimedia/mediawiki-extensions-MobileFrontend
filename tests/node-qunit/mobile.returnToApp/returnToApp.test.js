const
	bannerUtil = require( './util' ),
	config = require( '../../../src/mobile.returnToApp/config.json' ),
	dom = require( '../utils/dom' ),
	jQuery = require( '../utils/jQuery' ),
	makeFakeHookRegistry = require( '../utils/makeFakeHookRegistry' ),
	mediaWiki = require( '../utils/mw' ),
	sinon = require( 'sinon' );
let sandbox, returnToApp, store, originalHookFactory, originalLocation;

// This URL indicates a successful handover to a configured app with appropriate
// query params. The path here is mocked by ../utils/mw.
const savedUrlWithRevision = 'wikipedia://en.wikipedia.org/wiki/Cat?saved=true&revision=1234';
const savedUrlWithoutRevision = 'wikipedia://en.wikipedia.org/wiki/Cat?saved=true';

// Same as above but telling the app the user abandoned the edit.
const unsavedUrl = 'wikipedia://en.wikipedia.org/wiki/Cat?saved=false';

QUnit.module( 'MobileFrontend returnToApp.js', {
	beforeEach: function () {
		sandbox = sinon.createSandbox();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );

		// mw-node-qunit mocks mw.storage, but not the session variant of it
		store = {};
		mw.storage.session = {
			get: ( key ) => ( key in store ? store[ key ] : null ),
			set: ( key, value ) => {
				store[ key ] = value;
			},
			remove: ( key ) => {
				delete store[ key ];
			}
		};

		sandbox.stub( mw.util, 'getUrl' ).returns( '/wiki/Cat' );
		originalHookFactory = mw.hook;

		// Stand in for the real thing, which would try to navigate
		originalLocation = global.location;
		global.location = { href: '' };
		// Configure immediate redirect by default to make testing simpler.
		// location.href is an indicator of whether a redirect was triggered
		// with this configuration.
		config.MFReturnToAppBehavior = 'immediate';
		config.MFReturnToAppScheme = 'wikipedia';
		config.ServerName = 'en.wikipedia.org';
		returnToApp = require( '../../../src/mobile.returnToApp/returnToApp' );
	},
	afterEach: function () {
		mw.hook = originalHookFactory;
		// Other test files rely on a location left in place by an earlier one
		if ( originalLocation === undefined ) {
			delete global.location;
		} else {
			global.location = originalLocation;
		}
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( '#isEnabled', ( assert ) => {
	config.MFReturnToAppScheme = 'test-scheme';
	assert.true( returnToApp.isEnabled(), 'A configured scheme names an app.' );

	config.MFReturnToAppScheme = '';
	assert.false( returnToApp.isEnabled(), 'Without one there is no app.' );
} );

QUnit.test.each(
	'#init, pending handover',
	{
		'app scheme configured, pending handover present': { configured: true, handover: true, expectRedirect: true },
		'app scheme configured but pending handover absent': { configured: true, handover: false, expectRedirect: false },
		'pending handover present but app scheme unconfigured': { configured: false, handover: false, expectRedirect: false },
		'neither pending handover present nor app scheme configured': { configured: false, handover: false, expectRedirect: false }
	},
	( assert, { configured, handover, expectRedirect } ) => {
		assert.expect( 1 );
		config.MFReturnToAppScheme = configured ? 'wikipedia' : '';

		if ( handover ) {
			returnToApp.setPendingHandover( 1234 );
		}

		returnToApp.init();

		if ( expectRedirect ) {
			assert.strictEqual( global.location.href, savedUrlWithRevision, 'The pending handover is completed.' );
		} else {
			assert.strictEqual( global.location.href, '', 'No handover is completed.' );
		}
	} );

QUnit.test.each(
	'#init, reaction to editor close',
	{
		'app scheme configured, abandoned edit': { configured: true, switching: false, saved: false, expectRedirect: true },
		'app scheme configured, switching editor types': { configured: true, switching: true, saved: false, expectRedirect: false },
		'app scheme configured, editor closing before save': { configured: true, switching: false, saved: true, expectRedirect: false },
		'app scheme unconfigured, abandoned edit': { configured: false, switching: false, saved: false, expectRedirect: false },
		'app scheme unconfigured, switching editor types': { configured: false, switching: true, saved: false, expectRedirect: false },
		'app scheme unconfigured, editor closing before save': { configured: false, switching: false, saved: true, expectRedirect: false }
	},
	( assert, { configured, switching, saved, expectRedirect } ) => {
		assert.expect( 2 );
		config.MFReturnToAppScheme = configured ? 'wikipedia' : '';
		mw.hook = makeFakeHookRegistry();
		returnToApp.init();
		mw.hook( 'mobileFrontend.editorClosed' ).fire( switching, saved );
		assert.strictEqual( mw.storage.session.get( 'mobileFrontend/returnToAppRevId' ), null, "A pending handover isn't created." );

		if ( expectRedirect ) {
			assert.strictEqual( global.location.href, unsavedUrl, 'A redirect is triggered communicating that the edit was abandoned.' );
		} else {
			assert.strictEqual( global.location.href, '', 'No redirect is triggered.' );
		}
	} );

const saveHookPendingHandoverCases = {
	'app scheme configured with revision ID': { configured: true, revId: 1234, expectedHandoverValue: '1234' },
	'app scheme configured without revision ID': { configured: true, revId: undefined, expectedHandoverValue: '' },
	'app scheme unconfigured with revision ID': { configured: false, revId: 1234, expectedHandoverValue: null },
	'app scheme unconfigured without revision ID': { configured: false, revId: undefined, expectedHandoverValue: null }
};

QUnit.test.each(
	'#init, reaction to source editor save',
	saveHookPendingHandoverCases,
	( assert, { configured, revId, expectedHandoverValue } ) => {
		config.MFReturnToAppScheme = configured ? 'wikipedia' : '';
		mw.hook = makeFakeHookRegistry();
		returnToApp.init();
		mw.hook( 'mobileFrontend.sourceEditor.saveComplete' ).fire( revId );
		assert.strictEqual( global.location.href, '', 'A redirect is never triggered.' );
		assert.strictEqual( mw.storage.session.get( 'mobileFrontend/returnToAppRevId' ), expectedHandoverValue, 'A pending handover is created when appropriate.' );
	} );

QUnit.test.each(
	'#init, reaction to visual editor save with redirect',
	saveHookPendingHandoverCases,
	( assert, { configured, revId, expectedHandoverValue } ) => {
		config.MFReturnToAppScheme = configured ? 'wikipedia' : '';
		mw.hook = makeFakeHookRegistry();
		returnToApp.init();
		mw.hook( 'mobileFrontend.visualEditor.saveComplete' ).fire( revId, 'test-redirect-url' );
		assert.strictEqual( global.location.href, '', 'A redirect is never triggered.' );
		assert.strictEqual( mw.storage.session.get( 'mobileFrontend/returnToAppRevId' ), expectedHandoverValue, 'A pending handover is created when appropriate.' );
	} );

QUnit.test.each(
	'#init, reaction to visual editor save without redirect',
	{
		'app scheme configured, with revision ID': { configured: true, revId: 1234, expectedRedirect: savedUrlWithRevision },
		'app scheme configured, without revision ID': { configured: true, revId: undefined, expectedRedirect: savedUrlWithoutRevision },
		'app scheme unconfigured, with revision ID': { configured: false, revId: 1234, expectedRedirect: '' },
		'app scheme unconfigured, without revision ID': { configured: false, revId: undefined, expectedRedirect: '' }
	},
	( assert, { configured, revId, expectedRedirect } ) => {
		config.MFReturnToAppScheme = configured ? 'wikipedia' : '';
		mw.hook = makeFakeHookRegistry();
		returnToApp.init();
		mw.hook( 'mobileFrontend.visualEditor.saveComplete' ).fire( revId );
		assert.strictEqual( mw.storage.session.get( 'mobileFrontend/returnToAppRevId' ), null, "A pending handover isn't created." );
		assert.strictEqual( global.location.href, expectedRedirect, 'If appropriate, a redirect is triggered communicating that the edit was saved that includes revision ID.' );
	} );

const redirectToAppBehaviorCases = {
	'banner behavior': { MFReturnToAppBehavior: 'banner', expectBanner: true },
	'undefined behavior': { MFReturnToAppBehavior: undefined, expectBanner: false },
	'immediate behavior': { MFReturnToAppBehavior: 'immediate', expectBanner: false }
};
const getBanners = () => document.querySelectorAll( '.mw-mf-return-to-app-banner' );
const getBannerLink = () => document.querySelector( '.mw-mf-return-to-app-link' );

QUnit.test.each( '#redirectToApp, saved with revision', redirectToAppBehaviorCases, async ( assert, { expectBanner, MFReturnToAppBehavior } ) => {
	assert.expect( 2 );
	config.MFReturnToAppBehavior = MFReturnToAppBehavior;
	returnToApp.redirectToApp( true, 1234 );

	if ( expectBanner ) {
		await bannerUtil.waitForBannerContent();
		assert.strictEqual( getBanners().length, 1, 'A published edit shows a banner.' );
		assert.strictEqual( getBannerLink().getAttribute( 'href' ), savedUrlWithRevision, 'A published edit shows a banner link reporting the revision.' );
	} else {
		assert.strictEqual( global.location.href, savedUrlWithRevision, 'A published edit redirects to a URL that includes the revision it made.' );
		assert.strictEqual( getBanners().length, 0, "A published edit doesn't show a banner." );
	}
} );

QUnit.test.each( '#redirectToApp, saved without revision', redirectToAppBehaviorCases, async ( assert, { expectBanner, MFReturnToAppBehavior } ) => {
	assert.expect( 2 );
	config.MFReturnToAppBehavior = MFReturnToAppBehavior;
	returnToApp.redirectToApp( true );

	if ( expectBanner ) {
		await bannerUtil.waitForBannerContent();
		assert.strictEqual( getBanners().length, 1, 'An edit without a revision shows a banner.' );
		assert.strictEqual( getBannerLink().getAttribute( 'href' ), savedUrlWithoutRevision, 'An edit without a revision shows a banner link that omits the revision.' );
	} else {
		assert.strictEqual( global.location.href, savedUrlWithoutRevision, 'A published edit redirects to a URL that omits the revision.' );
		assert.strictEqual( getBanners().length, 0, "A published edit doesn't show a banner." );
	}
} );

QUnit.test.each( '#redirectToApp, abandoned edit', redirectToAppBehaviorCases, async ( assert, { expectBanner, MFReturnToAppBehavior } ) => {
	assert.expect( 2 );
	config.MFReturnToAppBehavior = MFReturnToAppBehavior;
	returnToApp.redirectToApp( false );

	if ( expectBanner ) {
		await bannerUtil.waitForBannerContent();
		assert.strictEqual( getBanners().length, 1, 'An abandoned edit shows a banner.' );
		assert.strictEqual( getBannerLink().getAttribute( 'href' ), unsavedUrl, 'An abandoned edit shows a banner link saying so.' );
	} else {
		assert.strictEqual( global.location.href, unsavedUrl, 'An abandoned edit redirects to a URL saying so.' );
		assert.strictEqual( getBanners().length, 0, "An abandoned edit doesn't show a banner." );
	}
} );

QUnit.test( '#redirectToApp, with no app configured', ( assert ) => {
	config.MFReturnToAppScheme = '';

	returnToApp.redirectToApp( true, 1234 );
	assert.strictEqual( global.location.href, '',
		'Nothing is navigated to, because there is no scheme to navigate with.' );
} );

QUnit.test( '#savedQuery', ( assert ) => {
	assert.strictEqual(
		returnToApp.savedQuery(),
		'returntoappsaved=1',
		'The parameter is a flag, so it carries no value.'
	);
} );

QUnit.test( '#setPendingHandover, #finishHandover', ( assert ) => {
	returnToApp.finishHandover();
	assert.strictEqual( global.location.href, '',
		'A page load which the editor did not mark is not a handover.' );

	returnToApp.setPendingHandover( 1234 );
	returnToApp.finishHandover();
	assert.strictEqual(
		global.location.href,
		'wikipedia://en.wikipedia.org/wiki/Cat?saved=true&revision=1234',
		'The kept revision id reaches the app.'
	);

	global.location.href = '';
	returnToApp.finishHandover();
	assert.strictEqual( global.location.href, '',
		'The handover happens once, so a reload does not repeat it.' );

	returnToApp.setPendingHandover();
	returnToApp.finishHandover();
	assert.strictEqual(
		global.location.href,
		'wikipedia://en.wikipedia.org/wiki/Cat?saved=true',
		'A save which made no revision is still a handover.'
	);
} );
