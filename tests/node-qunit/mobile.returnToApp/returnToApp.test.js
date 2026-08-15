const
	mediaWiki = require( '../utils/mw' ),
	sinon = require( 'sinon' );
let sandbox, returnToApp, store, originalLocation;

QUnit.module( 'MobileFrontend returnToApp.js', {
	beforeEach: function () {
		sandbox = sinon.createSandbox();
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

		sandbox.stub( mw.config, 'get' )
			.withArgs( 'wgServerName' ).returns( 'en.wikipedia.org' )
			.withArgs( 'wgMFReturnToAppScheme' ).returns( 'wikipedia' );
		sandbox.stub( mw.util, 'getUrl' ).returns( '/wiki/Cat' );

		// Stand in for the real thing, which would try to navigate
		originalLocation = global.location;
		global.location = { href: '' };

		returnToApp = require( '../../../src/mobile.returnToApp/returnToApp' );
	},
	afterEach: function () {
		// Other test files rely on a location left in place by an earlier one
		if ( originalLocation === undefined ) {
			delete global.location;
		} else {
			global.location = originalLocation;
		}
		sandbox.restore();
	}
} );

QUnit.test( '#isEnabled', ( assert ) => {
	assert.true( returnToApp.isEnabled(), 'A configured scheme names an app.' );

	mw.config.get.withArgs( 'wgMFReturnToAppScheme' ).returns( '' );
	assert.false( returnToApp.isEnabled(), 'Without one there is no app.' );
} );

QUnit.test( '#redirectToApp', ( assert ) => {
	returnToApp.redirectToApp( true, 1234 );
	assert.strictEqual(
		global.location.href,
		'wikipedia://en.wikipedia.org/wiki/Cat?saved=true&revision=1234',
		'A published edit reports the revision it made.'
	);

	returnToApp.redirectToApp( false );
	assert.strictEqual(
		global.location.href,
		'wikipedia://en.wikipedia.org/wiki/Cat?saved=false',
		'An abandoned edit has no revision to report.'
	);

	returnToApp.redirectToApp( true );
	assert.strictEqual(
		global.location.href,
		'wikipedia://en.wikipedia.org/wiki/Cat?saved=true',
		'The revision is left out when it is not known.'
	);
} );

QUnit.test( '#redirectToApp, with no app configured', ( assert ) => {
	mw.config.get.withArgs( 'wgMFReturnToAppScheme' ).returns( '' );

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
