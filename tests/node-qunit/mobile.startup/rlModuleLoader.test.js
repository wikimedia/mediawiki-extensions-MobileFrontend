var
	sinon = require( 'sinon' ),
	dom = require( '../utils/dom' ),
	jQuery = require( '../utils/jQuery' ),
	oo = require( '../utils/oo' ),
	mediaWiki = require( '../utils/mw' ),
	mustache = require( '../utils/mustache' ),
	util = require( '../../../src/mobile.startup/util' ),
	rlModuleLoader,
	sandbox;

function assertShowHideWorksWhenSuccessful( assert, firstArg, secondArg, thirdArg ) {
	var
		self = this,
		result;

	sandbox.stub( rlModuleLoader, 'newLoadingOverlay' ).returns( this.stub );

	result = rlModuleLoader.loadModule( firstArg, secondArg, thirdArg );

	assert.strictEqual( this.stub.show.callCount, 1, 'LoadingOverlay show() called once' );
	assert.strictEqual( this.stub.show.getCall( 0 ).args.length, 0, 'LoadingOverlay show() called with no args' );
	assert.strictEqual( this.stub.hide.callCount, 0, 'LoadingOverlay hide not called' );

	this.deferred.resolve();

	return result.then( function ( overlay ) {
		assert.strictEqual( overlay, self.stub, 'Promise resolves to overlay instance' );
		assert.strictEqual( self.stub.show.callCount, 1, 'LoadingOverlay show() called once' );
		assert.strictEqual( self.stub.hide.callCount, 1, 'LoadingOverlay hide() called once' );
		assert.strictEqual( self.stub.hide.getCall( 0 ).args.length, 0, 'LoadingOverlay hide() called with no args' );
	} );
}

QUnit.module( 'MobileFrontend rlModuleLoader.js', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		mustache.setUp( sandbox, global );
		rlModuleLoader = require( '../../../src/mobile.startup/rlModuleLoader' );

		// jsdom will throw "Not implemented" errors if we don't stub
		// window.scrollTo
		sandbox.stub( global.window, 'scrollTo' );

		this.stub = {
			appendTo: sandbox.spy(),
			show: sandbox.spy(),
			hide: sandbox.spy()
		};
		this.deferred = util.Deferred();

		sandbox.stub( mw.loader, 'using' )
			.withArgs( 'mobile.mediaViewer' )
			.returns( this.deferred );

	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( '#newLoadingOverlay does not blow up', function ( assert ) {
	assert.expect( 0 );

	rlModuleLoader.newLoadingOverlay();
} );

QUnit.test( '#loadModule when instructed to show/hide overlay and successful', function ( assert ) {
	return assertShowHideWorksWhenSuccessful.apply( this, [ assert, 'mobile.mediaViewer', false, true ] );
} );

QUnit.test( '#loadModule when instructed to show/hide overlay (default args) and successful', function ( assert ) {
	return assertShowHideWorksWhenSuccessful.apply( this, [ assert, 'mobile.mediaViewer', false ] );
} );

QUnit.test( '#loadModule when instructed to show/hide overlay and not successful', function ( assert ) {
	var
		self = this,
		result;

	sandbox.stub( rlModuleLoader, 'newLoadingOverlay' ).returns( this.stub );

	result = rlModuleLoader.loadModule( 'mobile.mediaViewer', false, true );

	this.deferred.reject();

	assert.rejects( result, 'returned promise rejects' );
	return result.catch( function () {
		assert.strictEqual( self.stub.show.callCount, 1, 'LoadingOverlay show() called once' );
		assert.strictEqual( self.stub.appendTo.callCount, 1, 'LoadingOverlay appendTo() called once' );
		assert.strictEqual( self.stub.hide.callCount, 1, 'LoadingOverlay hide() called once' );
		assert.strictEqual( self.stub.hide.getCall( 0 ).args.length, 0, 'LoadingOverlay hide() called with no args' );
	} );
} );

QUnit.test( '#loadModule when instructed to show/not hide overlay and successful', function ( assert ) {
	var
		self = this,
		result;

	sandbox.stub( rlModuleLoader, 'newLoadingOverlay' ).returns( this.stub );

	result = rlModuleLoader.loadModule( 'mobile.mediaViewer', true, true );

	assert.strictEqual( this.stub.show.callCount, 1, 'LoadingOverlay show() called once' );
	assert.strictEqual( this.stub.show.getCall( 0 ).args.length, 0, 'LoadingOverlay show() called with no args' );
	assert.strictEqual( this.stub.hide.callCount, 0, 'LoadingOverlay hide() not called' );

	this.deferred.resolve();

	return result.then( function ( overlay ) {
		assert.strictEqual( overlay, self.stub, 'Promise resolves to overlay instance' );
		assert.strictEqual( self.stub.show.callCount, 1, 'LoadingOverlay show() called once' );
		assert.strictEqual( self.stub.hide.callCount, 0, 'LoadingOverlay hide() not called' );
	} );
} );

QUnit.test( '#loadModule when instructed to show/not hide overlay and not successful', function ( assert ) {
	var
		self = this,
		result;

	sandbox.stub( rlModuleLoader, 'newLoadingOverlay' ).returns( this.stub );

	result = rlModuleLoader.loadModule( 'mobile.mediaViewer', true, true );

	this.deferred.reject();

	assert.rejects( result, 'returned promise rejects' );
	return result.catch( function () {
		assert.strictEqual( self.stub.show.callCount, 1, 'LoadingOverlay show() called once' );
		assert.strictEqual( self.stub.hide.callCount, 0, 'LoadingOverlay hide() not called' );
	} );
} );

QUnit.test( '#loadModule when instructed to not show overlay and successful', function ( assert ) {
	var
		self = this,
		result;

	sandbox.stub( rlModuleLoader, 'newLoadingOverlay' ).returns( this.stub );

	result = rlModuleLoader.loadModule( 'mobile.mediaViewer', false, false );

	assert.strictEqual( this.stub.show.callCount, 0, 'LoadingOverlay show() not called' );
	assert.strictEqual( this.stub.hide.callCount, 0, 'LoadingOverlay hide() not called' );

	this.deferred.resolve();

	return result.then( function ( overlay ) {
		assert.strictEqual( overlay, self.stub, 'Promise resolves to overlay instance' );
		assert.strictEqual( self.stub.show.callCount, 0, 'LoadingOverlay show() not called' );
		assert.strictEqual( self.stub.hide.callCount, 0, 'LoadingOverlay hide() not called' );
	} );
} );

QUnit.test( '#loadModule when instructed to not show overlay and not successful', function ( assert ) {
	var
		self = this,
		result;

	sandbox.stub( rlModuleLoader, 'newLoadingOverlay' ).returns( this.stub );

	result = rlModuleLoader.loadModule( 'mobile.mediaViewer', false, false );

	this.deferred.reject();

	assert.rejects( result, 'returned promise rejects' );
	return result.catch( function () {
		assert.strictEqual( self.stub.show.callCount, 0, 'LoadingOverlay show() not called' );
		assert.strictEqual( self.stub.hide.callCount, 0, 'LoadingOverlay hide() not called' );
	} );
} );
