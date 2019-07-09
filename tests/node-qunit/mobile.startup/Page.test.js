var
	dom = require( '../utils/dom' ),
	jQuery = require( '../utils/jQuery' ),
	mw = require( '../utils/mw' ),
	mustache = require( '../utils/mustache' ),
	oo = require( '../utils/oo' ),
	// These both have heavy dependencies on jQuery so must be loaded later.
	Page,
	sinon = require( 'sinon' );
/* eslint-disable one-var */
/** @type {sinon.SinonSandbox} */ var sandbox;
/* eslint-enable one-var */

QUnit.module( 'MobileFrontend Page.js', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		mw.setUp( sandbox, global );
		mustache.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );

		Page = require( '../../../src/mobile.startup/Page' );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( '#isMainPage', function ( assert ) {
	var p = new Page( {
			title: 'Main Page',
			isMainPage: true
		} ),
		p2 = new Page( {
			title: 'Foo'
		} );
	assert.strictEqual( p.isMainPage(), true, 'check main page flag is updated' );
	assert.strictEqual( p2.isMainPage(), false, 'check not marked as main page' );
} );
