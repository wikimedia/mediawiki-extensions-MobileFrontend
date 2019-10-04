let
	sandbox;
const
	getDeviceLanguage = require( '../../../../src/mobile.startup/languageOverlay/getDeviceLanguage' ),
	sinon = require( 'sinon' );

QUnit.module( 'MobileFrontend getDeviceLanguage', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
	},
	afterEach: function () {
		sandbox.restore();
	}
} );

QUnit.test( 'returns language code of device in lowercase', function ( assert ) {
	const cases = [
		[ {}, undefined ],
		[ { languages: [ 'en-US' ] }, 'en-us' ],
		[ { language: 'en-US' }, 'en-us' ],
		[ { userLanguage: 'en-US' }, 'en-us' ],
		[ { browserLanguage: 'en-US' }, 'en-us' ],
		[ { systemLanguage: 'en-US' }, 'en-us' ]
	];

	cases.forEach( function ( testCase ) {
		const result = getDeviceLanguage( testCase[ 0 ] );
		assert.strictEqual( result, testCase[1], 'returns correct code' );
	} );
} );
