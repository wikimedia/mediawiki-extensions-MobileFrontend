const
	sinon = require( 'sinon' ),
	dom = require( '../utils/dom' ),
	jQuery = require( '../utils/jQuery' ),
	oo = require( '../utils/oo' ),
	mediaWiki = require( '../utils/mw' ),
	mustache = require( '../utils/mustache' );
let
	Button,
	sandbox;

QUnit.module( 'MobileFrontend Button.js', {
	beforeEach: function () {
		sandbox = sinon.createSandbox();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		mustache.setUp( sandbox, global );
		Button = require( '../../../src/mobile.startup/Button' );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'creates a link if passed href option', ( assert ) => {
	const
		url = 'https://www.foo.com',
		button = new Button( {
			href: url
		} );

	assert.strictEqual( button.$el[0].tagName, 'A' );
	assert.strictEqual( button.$el[0].getAttribute( 'href' ), 'https://www.foo.com' );
} );

QUnit.test( 'does not add href attribute when not a link', ( assert ) => {
	const button = new Button( {
		tagName: 'div'
	} );

	assert.strictEqual( button.$el[0].tagName, 'DIV' );
	assert.strictEqual( button.$el[0].href, undefined );
} );
