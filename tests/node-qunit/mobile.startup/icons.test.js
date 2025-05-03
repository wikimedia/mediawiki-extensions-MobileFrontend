let sandbox, icons, spy;
const
	sinon = require( 'sinon' ),
	dom = require( '../utils/dom' ),
	jQuery = require( '../utils/jQuery' ),
	mediaWiki = require( '../utils/mw' ),
	mustache = require( '../utils/mustache' ),
	oo = require( '../utils/oo' );

QUnit.module( 'MobileFrontend icons.js', {
	beforeEach: function () {
		sandbox = sinon.createSandbox();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		mustache.setUp( sandbox, global );
		icons = require( '../../../src/mobile.startup/icons' );
		spy = sandbox.spy( icons, 'IconButton' );
	},
	afterEach: function () {
		sandbox.restore();
		jQuery.tearDown();
	}
} );

QUnit.test( '#cancel()', ( assert ) => {
	icons.cancel();
	assert.propEqual( spy.getCall( 0 ).args[ 0 ], {
		tagName: 'button',
		icon: icons.CANCEL_GLYPH,
		additionalClassNames: ' cancel',
		label: mw.msg( 'mobile-frontend-overlay-close' ),
		isTypeButton: true
	}, 'Options are passed down' );
} );

QUnit.test( '#cancel(variant)', ( assert ) => {
	icons.cancel( 'gray' );
	assert.propEqual( spy.getCall( 0 ).args[ 0 ], {
		tagName: 'button',
		icon: icons.CANCEL_GLYPH + '-gray',
		additionalClassNames: ' cancel',
		label: mw.msg( 'mobile-frontend-overlay-close' ),
		isTypeButton: true
	}, 'Options are passed down' );
} );

QUnit.test( '#cancel(, props)', ( assert ) => {
	icons.cancel( '', { additionalClassNames: 'test' } );
	assert.propEqual( spy.getCall( 0 ).args[ 0 ], {
		tagName: 'button',
		icon: icons.CANCEL_GLYPH,
		additionalClassNames: 'test cancel',
		label: mw.msg( 'mobile-frontend-overlay-close' ),
		isTypeButton: true
	}, 'Options are passed down' );
} );

QUnit.test( '#spinner(props)', ( assert ) => {
	icons.spinner( {
		foo: 'will be passed down',
		additionalClassNames: 'will-not-be-ignored'
	} );
	assert.propEqual( spy.getCall( 0 ).args[ 0 ], {
		tagName: 'span',
		foo: 'will be passed down',
		additionalClassNames: 'will-not-be-ignored',
		icon: 'spinner',
		label: mw.msg( 'mobile-frontend-loading-message' )
	}, 'Options are passed down' );
} );

QUnit.test( '#spinner()', ( assert ) => {
	icons.spinner( {
		foo: 'will be passed down'
	} );
	assert.propEqual( spy.getCall( 0 ).args[ 0 ], {
		tagName: 'span',
		foo: 'will be passed down',
		additionalClassNames: 'spinner loading',
		icon: 'spinner',
		label: mw.msg( 'mobile-frontend-loading-message' )
	}, 'Options are passed down' );
} );
