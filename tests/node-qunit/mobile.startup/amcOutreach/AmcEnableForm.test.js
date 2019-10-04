let
	AmcEnableForm,
	sandbox;
const
	jQuery = require( '../../utils/jQuery' ),
	dom = require( '../../utils/dom' ),
	oo = require( '../../utils/oo' ),
	mediaWiki = require( '../../utils/mw' ),
	mustache = require( '../../utils/mustache' ),
	sinon = require( 'sinon' );

QUnit.module( 'MobileFrontend amcOutreach/AmcEnableForm.js', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		mustache.setUp( sandbox, global );

		AmcEnableForm = require( '../../../../src/mobile.startup/amcOutreach/AmcEnableForm' );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'renders correctly', function ( assert ) {
	const subject = new AmcEnableForm( {
		postUrl: 'https://foo.com',
		fields: [
			{
				name: 'f1name',
				value: 'f1value'
			},
			{
				name: 'f2name',
				value: 'f2value'
			}
		],
		buttonLabel: 'Submit'
	} );

	assert.strictEqual( subject.$el.is( 'form' ), true, 'Form is rendered' );
	assert.strictEqual( subject.$el.attr( 'action' ), 'https://foo.com', 'Form action is passed in postUrl' );
	assert.strictEqual( subject.$el.attr( 'method' ), 'POST', 'Form method is POST' );
	assert.strictEqual( subject.$el.find( 'input[name=\'f1name\'][value=\'f1value\']' ).length, 1, 'Field 1 is rendered' );
	assert.strictEqual( subject.$el.find( 'input[name=\'f2name\'][value=\'f2value\']' ).length, 1, 'Field 2 is rendered' );
	assert.strictEqual( subject.$el.find( 'button' ).length, 1, 'Submit button is rendered' );
	assert.strictEqual( subject.$el.find( 'button' ).text(), 'Submit', 'Submit button has label' );
} );
