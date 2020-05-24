let mfExtend;
const
	sinon = require( 'sinon' ),
	oo = require( '../utils/oo' );

/** @type {sinon.SinonSandbox} */ let sandbox;

QUnit.module( 'MobileFrontend mfExtend.test.js', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		oo.setUp( sandbox, global );
		mfExtend = require( '../../../src/mobile.startup/mfExtend' );
	},
	afterEach: function () { sandbox.restore(); }
} );

QUnit.test( 'mfExtend() - extending from constructor', function ( assert ) {
	function TestChild() {}
	function TestPrototype() {}
	mfExtend( TestChild, TestPrototype, {} );
	assert.strictEqual( TestChild.prototype instanceof TestPrototype, true );
} );

QUnit.test( 'mfExtend() - extending from object', function ( assert ) {
	const testPrototype = new TestPrototype();
	function TestChild() {}
	function TestPrototype() {
		this.protoMethod = function () {
			return true;
		};
	}
	mfExtend( TestChild, testPrototype );
	const testChild = new TestChild();
	assert.strictEqual( testChild.protoMethod(), true );
} );

QUnit.test( 'mfExtend() - extending from constructor with overrides', function ( assert ) {
	function TestChild() {}
	function TestPrototype() {
		this.protoMethod = function () {
			return true;
		};
	}
	mfExtend( TestChild, TestPrototype, {
		protoMethod: function () {
			return false;
		}
	} );
	const testChild = new TestChild();
	assert.strictEqual( testChild.protoMethod(), false );
} );
