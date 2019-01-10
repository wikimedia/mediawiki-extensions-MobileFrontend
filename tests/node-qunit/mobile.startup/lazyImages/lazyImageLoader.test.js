var
	jQuery = require( '../../utils/jQuery' ),
	dom = require( '../../utils/dom' ),
	lazyImageLoader = require( '../../../../src/mobile.startup/lazyImages/lazyImageLoader' ),
	mediaWiki = require( '../../utils/mw' ),
	sinon = require( 'sinon' ),
	util = require( '../../../../src/mobile.startup/util' ),
	sandbox;

QUnit.module( 'MobileFrontend lazyImageLoader.js', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( '#loadImages (success)', function ( assert ) {
	var stub = sandbox.stub( lazyImageLoader, 'loadImage' )
		.returns( util.Deferred().resolve() );

	return lazyImageLoader.loadImages( [
		util.parseHTML( '<div>' ), util.parseHTML( '<div>' )
	] ).then( function () {
		assert.strictEqual( stub.callCount, 2,
			'Stub was called twice and resolves successfully.' );
	} );
} );

QUnit.test( '#loadImages (one image fails)', function ( assert ) {
	var stub = sandbox.stub( lazyImageLoader, 'loadImage' );

	stub.onCall( 0 ).returns( util.Deferred().resolve() );
	stub.onCall( 1 ).returns( util.Deferred().reject() );

	return lazyImageLoader.loadImages( [
		util.parseHTML( '<div>' ), util.parseHTML( '<div>' )
	] ).catch( function () {
		assert.strictEqual( stub.callCount, 2,
			'Stub was called twice and overall result was failure.' );
	} );
} );

QUnit.test( '#loadImages (empty list)', function ( assert ) {
	return lazyImageLoader.loadImages( [] ).then( function () {
		assert.ok( true, 'An empty list always resolves successfully' );
	} );
} );
