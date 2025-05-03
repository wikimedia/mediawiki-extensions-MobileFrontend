let util;
const
	dom = require( '../utils/dom' ),
	mw = require( '../utils/mw' ),
	jQuery = require( '../utils/jQuery' ),
	oo = require( '../utils/oo' ),
	sinon = require( 'sinon' );

/** @type {sinon.SinonSandbox} */ let sandbox;

QUnit.module( 'MobileFrontend util.js', {
	beforeEach: function () {
		sandbox = sinon.createSandbox();
		dom.setUp( sandbox, global );
		mw.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		util = require( '../../../src/mobile.startup/util' );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'Promise.all() success', ( assert ) => {
	const p = util.Deferred(),
		p2 = util.Deferred();

	p.resolve( 'a' );
	p2.resolve( 'b' );
	return util.Promise.all( [ p, p2 ] ).then( ( result, result2 ) => {
		assert.strictEqual( result, 'a', 'All promises resolved (yay)' );
		assert.strictEqual( result2, 'b', 'All promises resolved (yay)' );
	} );
} );

QUnit.test( 'Promise.all() reject', ( assert ) => {
	const p = util.Deferred(),
		p2 = util.Deferred();

	p.resolve( 'a' );
	p2.reject( 'b' );
	return util.Promise.all( [ p, p2 ] ).catch( ( result ) => {
		assert.strictEqual( result, 'b', 'The promise rejects' );
	} );
} );

QUnit.test( 'escapeSelector()', ( assert ) => {
	assert.strictEqual(
		util.escapeSelector( '#selector-starts-with-hash' ),
		'\\#selector-starts-with-hash'
	);
} );

QUnit.test( 'docReady()', ( assert ) => {
	const done = assert.async();

	util.docReady( () => {
		assert.true( true, 'docReady calls the callback eventually' );
		done();
	} );
} );

QUnit.test( 'Deferred() - resolve', ( assert ) => {
	const deferred = util.Deferred(),
		response = 'response';
	deferred.resolve( response );
	return deferred.then( ( res ) => {
		assert.strictEqual( res, response );
	} );
} );

QUnit.test( 'Deferred() - reject', ( assert ) => {
	const deferred = util.Deferred(),
		response = 'response';
	deferred.reject( response );
	return deferred.catch( ( error ) => {
		assert.strictEqual( error, response );
	} );
} );
QUnit.test( 'getDocument()', ( assert ) => {
	assert.strictEqual( util.getDocument().length, 1 );
} );

QUnit.test( 'getWindow()', ( assert ) => {
	assert.strictEqual( util.getWindow().length, 1 );
} );

QUnit.test( 'parseHTML()', ( assert ) => {
	const htmlFragment = util.parseHTML( '<p>element content</p>', document );
	assert.strictEqual( typeof htmlFragment, 'object' );
	assert.strictEqual( htmlFragment[ 0 ].innerHTML, 'element content' );
} );

QUnit.test( 'extend()', ( assert ) => {
	const a = { a: 'apple' },
		b = { b: 'banana' };
	util.extend( a, b );
	assert.strictEqual( JSON.stringify( a ), '{"a":"apple","b":"banana"}' );
} );
