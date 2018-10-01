var util,
	dom = require( '../utils/dom' ),
	mw = require( '../utils/mw' ),
	jQuery = require( '../utils/jQuery' ),
	sinon = require( 'sinon' );

/** @type {sinon.SinonSandbox} */ var sandbox; // eslint-disable-line one-var

QUnit.module( 'MobileFrontend util.js', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		mw.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		util = require( '../../../src/mobile.startup/util' );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'escapeSelector()', function ( assert ) {
	assert.strictEqual(
		util.escapeSelector( '#selector-starts-with-hash' ),
		'\\#selector-starts-with-hash' // eslint-disable-line no-useless-escape
	);
} );

QUnit.test( 'grep()', function ( assert ) {
	assert.deepEqual(
		util.grep( [ 1, 2 ], function ( n ) {
			return n > 1;
		} ),
		[ 2 ]
	);
} );

QUnit.test( 'docReady()', function ( assert ) {
	var docReady = util.docReady();
	assert.strictEqual(
		docReady instanceof $, // eslint-disable-line
		true
	);
} );

QUnit.test( 'when()', function ( assert ) {
	return util.when( { resolved: true } ).then( function ( res ) {
		assert.strictEqual(
			res.resolved,
			true
		);
	} );
} );

QUnit.test( 'parseHTML()', function ( assert ) {
	var htmlFragment = util.parseHTML( '<p>element content</p>', document );
	assert.strictEqual( typeof htmlFragment === 'object', true );
	assert.strictEqual( htmlFragment[ 0 ].innerHTML, 'element content' );
} );

QUnit.test( 'isNumeric()', function ( assert ) {
	assert.strictEqual( util.isNumeric( 123 ), true );
	assert.strictEqual( util.isNumeric( '123' ), true );
	assert.strictEqual( util.isNumeric( 'The string 123 is true? I don\'t like it.' ), false );
	assert.strictEqual( util.isNumeric( NaN ), false );
} );

QUnit.test( 'escapeHash()', function ( assert ) {
	assert.strictEqual( util.escapeHash( '#escape:...hash' ), '#escape\\:\\.\\.\\.hash' );
} );

QUnit.test( 'isModifiedEvent() - true', function ( assert ) {
	var testEl = document.createElement( 'div' );

	testEl.addEventListener( 'click', function ( ev ) {
		assert.strictEqual( util.isModifiedEvent( ev ), true );
	} );

	testEl.dispatchEvent( new window.MouseEvent( 'click', { ctrlKey: true } ) );
} );

QUnit.test( 'isModifiedEvent() - false', function ( assert ) {
	var testEl = document.createElement( 'div' );

	testEl.addEventListener( 'click', function ( ev ) {
		assert.strictEqual( util.isModifiedEvent( ev ), false );
	} );

	testEl.dispatchEvent( new window.MouseEvent( 'click' ) );
} );
