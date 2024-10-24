const
	sinon = require( 'sinon' ),
	dom = require( '../utils/dom' ),
	jQuery = require( '../utils/jQuery' ),
	oo = require( '../utils/oo' ),
	mediaWiki = require( '../utils/mw' ),
	mustache = require( '../utils/mustache' );
let
	Icon,
	sandbox;

QUnit.module( 'MobileFrontend Icon.js', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		mustache.setUp( sandbox, global );
		Icon = require( '../../../src/mobile.startup/Icon' );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'getIconClasses generates icon classes using icon', ( assert ) => {
	const icon = new Icon( {
		icon: 'user'
	} );

	assert.strictEqual( icon.getIconClasses(), 'mf-icon mf-icon-user ' );
} );

QUnit.test( 'getIconClasses generates icon classes using custom icon prefix', ( assert ) => {
	const icon = new Icon( {
		icon: 'user',
		glyphPrefix: 'wikimedia'
	} );

	assert.strictEqual( icon.getIconClasses(), 'mf-icon mf-icon-wikimedia-user ' );
} );

QUnit.test( 'getRotationClasses returns rotation classes', ( assert ) => {
	const iconNeg180 = new Icon( { rotation: -180 } );
	const icon180 = new Icon( { rotation: 180 } );
	const iconNeg90 = new Icon( { rotation: -90 } );
	const icon90 = new Icon( { rotation: 90 } );

	assert.strictEqual( iconNeg180.getRotationClass(), 'mf-icon-rotate-flip' );
	assert.strictEqual( icon180.getRotationClass(), 'mf-icon-rotate-flip' );
	assert.strictEqual( iconNeg90.getRotationClass(), 'mf-icon-rotate-anti-clockwise' );
	assert.strictEqual( icon90.getRotationClass(), 'mf-icon-rotate-clockwise' );
} );

QUnit.test( 'getGlyphClassName uses icon prefix', ( assert ) => {
	const icon = new Icon( {
		icon: 'user',
		glyphPrefix: 'wikimedia'
	} );

	assert.strictEqual( icon.getGlyphClassName(), 'mf-icon-wikimedia-user' );
} );

QUnit.test( 'getGlyphClassName does not use icon prefix if not provided', ( assert ) => {
	const icon = new Icon( {
		icon: 'user',
		glyphPrefix: ''
	} );

	assert.strictEqual( icon.getGlyphClassName(), 'mf-icon-user' );
} );

QUnit.test( 'adds small classes', ( assert ) => {
	const icon = new Icon( {
		icon: 'user',
		isSmall: true
	} );

	assert.strictEqual( icon.getClassName(), 'mf-icon mf-icon-user mf-icon--small ' );
} );
