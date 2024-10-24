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
	afterEach: function () {
		sandbox.restore();
	}
} );

QUnit.test( 'mfExtend() - extending from constructor', ( assert ) => {
	function TestChild() {}
	function TestPrototype() {}
	mfExtend( TestChild, TestPrototype, {} );
	assert.true( TestChild.prototype instanceof TestPrototype );
} );

QUnit.test( 'mfExtend() - extending from object', ( assert ) => {
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

QUnit.test( 'mfExtend() - extending from constructor with overrides', ( assert ) => {
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
