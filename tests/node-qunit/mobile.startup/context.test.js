var sandbox,
	sinon = require( 'sinon' ),
	mediaWiki = require( '../utils/mw' ),
	context = require( '../../../src/mobile.startup/context' );

QUnit.module( 'MobileFrontend context.js', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		mediaWiki.setUp( sandbox, global );
	},
	afterEach: function () { sandbox.restore(); }
} );

QUnit.test( 'getMode()', function ( assert ) {
	sandbox.stub( mw.config, 'get' ).withArgs( 'wgMFMode' )
		.returns( 'stable' );
	assert.strictEqual( context.getMode(), 'stable', 'Value comes straight from config' );
} );
