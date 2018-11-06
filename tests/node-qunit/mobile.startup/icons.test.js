var sandbox, icons, spy,
	sinon = require( 'sinon' ),
	dom = require( '../utils/dom' ),
	jQuery = require( '../utils/jQuery' ),
	mediaWiki = require( '../utils/mw' ),
	oo = require( '../utils/oo' );

QUnit.module( 'MobileFrontend icons.js', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		icons = require( '../../../src/mobile.startup/icons' );
		spy = sandbox.spy( icons, 'Icon' );
	},
	afterEach: function () {
		sandbox.restore();
		jQuery.tearDown();
	}
} );

QUnit.test( '#spinner()', function ( assert ) {
	icons.spinner( {
		foo: 'will be passed down',
		additionalClassNames: 'will-be-ignored'
	} );
	assert.deepEqual( spy.getCall( 0 ).args[ 0 ], {
		foo: 'will be passed down',
		additionalClassNames: 'spinner loading',
		name: 'spinner',
		label: mw.msg( 'mobile-frontend-loading-message' )
	}, 'Options are passed down' );
} );
