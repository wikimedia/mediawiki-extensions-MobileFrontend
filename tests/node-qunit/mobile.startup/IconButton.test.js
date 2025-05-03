const
	sinon = require( 'sinon' ),
	dom = require( '../utils/dom' ),
	jQuery = require( '../utils/jQuery' ),
	oo = require( '../utils/oo' ),
	mediaWiki = require( '../utils/mw' ),
	mustache = require( '../utils/mustache' );
let
	IconButton,
	sandbox;

QUnit.module( 'MobileFrontend IconButton.js', {
	beforeEach: function () {
		sandbox = sinon.createSandbox();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		mustache.setUp( sandbox, global );
		IconButton = require( '../../../src/mobile.startup/IconButton' );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'creates a link if passed href option', ( assert ) => {
	const
		url = 'https://www.foo.com',
		button = new IconButton( {
			href: url
		} );

	assert.strictEqual( button.$el[0].tagName, 'A' );
	assert.strictEqual( button.$el[0].getAttribute( 'href' ), url );
} );

QUnit.test( 'does not add href attribute when not a link', ( assert ) => {
	const button = new IconButton( {
		tagName: 'div'
	} );

	assert.strictEqual( button.$el[0].tagName, 'DIV' );
	assert.strictEqual( button.$el[0].href, undefined );
} );

QUnit.test( 'adds disabled attribute when a button', ( assert ) => {
	const button = new IconButton( {
		tagName: 'button',
		disabled: true
	} );

	assert.strictEqual( button.$el[0].tagName, 'BUTTON' );
	assert.strictEqual( button.$el[0].disabled, true );
} );

QUnit.test( 'does not add disabled attribute when not a button', ( assert ) => {
	const button = new IconButton( {
		tagName: 'div',
		disabled: true
	} );

	assert.strictEqual( button.$el[0].tagName, 'DIV' );
	assert.strictEqual( button.$el[0].disabled, undefined );
} );

QUnit.test( 'adds additional classes', ( assert ) => {
	const button = new IconButton( {
		icon: 'user',
		additionalClassNames: 'test'
	} );

	assert.strictEqual( button.getButtonClasses(), 'cdx-button cdx-button--size-large cdx-button--weight-quiet cdx-button--icon-only test' );
} );
