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

QUnit.test( '#cancel()', function ( assert ) {
	icons.cancel();
	assert.deepEqual( spy.getCall( 0 ).args[ 0 ], {
		tagName: 'button',
		name: icons.CANCEL_GLYPH,
		additionalClassNames: 'cancel',
		label: mw.msg( 'mobile-frontend-overlay-close' )
	}, 'Options are passed down' );
} );

QUnit.test( '#cancel(variant)', function ( assert ) {
	icons.cancel( 'gray' );
	assert.deepEqual( spy.getCall( 0 ).args[ 0 ], {
		tagName: 'button',
		name: icons.CANCEL_GLYPH + '-gray',
		additionalClassNames: 'cancel',
		label: mw.msg( 'mobile-frontend-overlay-close' )
	}, 'Options are passed down' );
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
