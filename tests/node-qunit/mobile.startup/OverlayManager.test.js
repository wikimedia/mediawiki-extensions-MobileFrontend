/* global $ */
var
	sinon = require( 'sinon' ),
	dom = require( '../utils/dom' ),
	jQuery = require( '../utils/jQuery' ),
	oo = require( '../utils/oo' ),
	util = require( '../../../src/mobile.startup/util' ),
	mediaWiki = require( '../utils/mw' ),
	mustache = require( '../utils/mustache' ),
	OverlayManager, Overlay,
	fakeRouter,
	overlayManager,
	routeEvent,
	sandbox;

QUnit.module( 'MobileFrontend mobile.startup/OverlayManager', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		mustache.setUp( sandbox, global );

		// jsdom will throw "Not implemented" errors if we don't stub
		// window.scrollTo
		sandbox.stub( global.window, 'scrollTo' );

		OverlayManager = require( '../../../src/mobile.startup/OverlayManager' );
		Overlay = require( '../../../src/mobile.startup/Overlay' );
		routeEvent = function ( data ) {
			return $.Event( 'route', data );
		};

		this.createFakeOverlay = function ( options ) {
			var fakeOverlay = new OO.EventEmitter();
			fakeOverlay.show = sandbox.spy();
			fakeOverlay.hide = function () {
				this.emit( 'hide' );
				return true;
			};
			fakeOverlay.$el = util.parseHTML( '<div>' );
			sandbox.spy( fakeOverlay, 'hide' );
			util.extend( fakeOverlay, options );
			return fakeOverlay;
		};

		fakeRouter = new OO.EventEmitter();
		fakeRouter.getPath = sandbox.stub().returns( '' );
		fakeRouter.back = sandbox.spy();
		sandbox.stub( mw.loader, 'require' ).withArgs( 'mediawiki.router' ).returns( fakeRouter );
		overlayManager = new OverlayManager( fakeRouter, document.body );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( '#getSingleton', function ( assert ) {
	var singleton = OverlayManager.getSingleton();
	assert.ok( singleton instanceof OverlayManager, 'singleton exists' );
	assert.strictEqual( singleton, OverlayManager.getSingleton(), 'same object returned each time' );
} );

QUnit.test( '#add', function ( assert ) {
	var fakeOverlay = this.createFakeOverlay();

	overlayManager.add( /^test$/, function () {
		return fakeOverlay;
	} );
	fakeRouter.emit( 'route', {
		path: 'test'
	} );

	assert.strictEqual( fakeOverlay.show.callCount, 1, 'show registered overlay' );
} );

QUnit.test( '#show', function ( assert ) {
	var fakeOverlay = this.createFakeOverlay(),
		showSpy = sandbox.spy( overlayManager, '_show' );

	overlayManager.add( /^showTest$/, function () {
		return fakeOverlay;
	} );
	fakeRouter.emit( 'route', {
		path: 'showTest'
	} );

	assert.strictEqual( showSpy.callCount, 1, 'OverlayManager.show called on route change' );
} );

QUnit.test( '#add, with $.Deferred factory', function ( assert ) {
	var deferred = util.Deferred(),
		fakeOverlay = this.createFakeOverlay();
	deferred.show = sandbox.spy();

	overlayManager.add( /^foo$/, function () {
		return deferred;
	} );
	fakeRouter.emit( 'route', {
		path: 'foo'
	} );
	deferred.resolve( fakeOverlay );

	return deferred.then( function () {
		assert.notOk( deferred.show.called, 'don\'t call show on Deferred' );
		assert.strictEqual( fakeOverlay.show.callCount, 1, 'show registered overlay' );
	} );
} );

QUnit.test( '#add, with current path', function ( assert ) {
	var
		fakeOverlay = this.createFakeOverlay(),
		deferred = util.Deferred();
	fakeRouter.getPath = sandbox.stub().returns( 'baha' );

	overlayManager.add( /^baha$/, function () {
		return fakeOverlay;
	} );

	// Wait for $.ready because OverlayManager#add() does
	util.docReady( function () {
		deferred.resolve();
	} );

	return deferred.then( function () {
		assert.strictEqual( fakeOverlay.show.callCount, 1, 'show registered overlay' );
	} );
} );

QUnit.test( '#replaceCurrent', function ( assert ) {
	var fakeOverlay = this.createFakeOverlay(),
		anotherFakeOverlay = this.createFakeOverlay();

	overlayManager.add( /^test$/, function () {
		return fakeOverlay;
	} );

	fakeRouter.emit( 'route', {
		path: 'test'
	} );
	overlayManager.replaceCurrent( anotherFakeOverlay );
	assert.strictEqual( fakeOverlay.hide.callCount, 1, 'hide overlay' );
	assert.strictEqual( anotherFakeOverlay.show.callCount, 1, 'show another overlay' );
	fakeRouter.emit( 'route', {
		path: ''
	} );
	assert.strictEqual( anotherFakeOverlay.hide.callCount, 1, 'hide another overlay' );
} );

QUnit.test( 'route with params', function ( assert ) {
	var
		fakeOverlay = this.createFakeOverlay(),
		factoryStub = sandbox.stub().returns( fakeOverlay );

	overlayManager.add( /^sam\/(\d+)$/, factoryStub );
	fakeRouter.emit( 'route', {
		path: 'sam/123'
	} );

	assert.ok( factoryStub.calledWith( '123' ), 'pass params from the route' );
} );

QUnit.test( 'hide when route changes', function ( assert ) {
	var
		fakeOverlay = this.createFakeOverlay(),
		factoryStub = sandbox.stub().returns( fakeOverlay );

	overlayManager.add( /^jon$/, factoryStub );
	fakeRouter.emit( 'route', {
		path: 'jon'
	} );
	fakeRouter.emit( 'route', {
		path: ''
	} );
	fakeRouter.emit( 'route', {
		path: 'jon'
	} );
	fakeRouter.emit( 'route', {
		path: 'other'
	} );

	assert.strictEqual( fakeOverlay.hide.callCount, 2, 'hide overlay' );
	assert.ok( fakeOverlay.hide.getCall( 0 ).notCalledWith( true ), 'don\'t force hide (first)' );
	assert.ok( fakeOverlay.hide.getCall( 1 ).notCalledWith( true ), 'don\'t force hide (second)' );
} );

QUnit.test( 'go back (change route) if overlay hidden but not by route change', function ( assert ) {
	var
		fakeOverlay = this.createFakeOverlay(),
		factoryStub = sandbox.stub().returns( fakeOverlay );

	overlayManager.add( /^joakino$/, factoryStub );
	fakeRouter.emit( 'route', {
		path: 'joakino'
	} );
	fakeOverlay.hide();

	assert.strictEqual( fakeRouter.back.callCount, 1, 'route back' );
} );

QUnit.test( 'Browser back can be overidden', function ( assert ) {
	var escapableOverlay = new Overlay( {} ),
		done = assert.async(),
		$container = util.parseHTML( '<div>' ),
		cannotGoBackOverlay = new Overlay( {
			onBeforeExit: function () {}
		} ),
		manager = new OverlayManager( fakeRouter, $container[ 0 ] );

	// define 2 routes
	manager.add( /^proceed$/, function () {
		return escapableOverlay;
	} );
	manager.add( /^youcannotpass$/, function () {
		return cannotGoBackOverlay;
	} );
	fakeRouter.emit( 'route', routeEvent( { path: 'proceed' } ) );
	assert.strictEqual( $container.find( escapableOverlay.$el ).length, 1,
		'escapable overlay is displayed' );
	fakeRouter.emit( 'route', routeEvent( { path: 'youcannotpass' } ) );
	// emitting route will trigger the display of an overlay associated with the path.
	// showing is an asynchronous process controlled via setTimeout
	// hence this is an asynchronous test.
	setTimeout( () => {
		assert.strictEqual( $container.find( escapableOverlay.$el ).length, 0,
			'escapable overlay is no longer displayed' );
		assert.strictEqual( $container.find( cannotGoBackOverlay.$el ).length, 1,
			'cannot go back overlay is now the overlay on display' );
		// attempt to go back
		fakeRouter.emit( 'route', routeEvent( { path: 'proceed' } ) );
		setTimeout( () => {
			assert.strictEqual( $container.find( cannotGoBackOverlay.$el ).length, 1,
				'cannot go back overlay is still the overlay on display (cannot exit!)' );
			assert.strictEqual( $container.find( escapableOverlay.$el ).length, 0,
				'Escapeable overlay is not displayed' );
			assert.strictEqual( manager.stack[0].overlay, cannotGoBackOverlay,
				'Cannot go back overlay remains on the top of the stack' );
			done();
		}, 0 );
	}, 0 );
} );

QUnit.test( 'stacked overlays', function ( assert ) {
	var
		fakeOverlay = this.createFakeOverlay(),
		factoryStub = sandbox.stub().returns( fakeOverlay ),
		parentFakeOverlay = this.createFakeOverlay(),
		parentFactoryStub = sandbox.stub().returns( parentFakeOverlay );

	overlayManager.add( /^parent$/, parentFactoryStub );
	overlayManager.add( /^child$/, factoryStub );

	fakeRouter.emit( 'route', {
		path: 'parent'
	} );
	assert.strictEqual( parentFakeOverlay.show.callCount, 1, 'show parent' );
	fakeRouter.emit( 'route', {
		path: 'child'
	} );
	assert.strictEqual( parentFakeOverlay.hide.callCount, 1, 'hide parent' );
	assert.strictEqual( fakeOverlay.show.callCount, 1, 'show child' );
	fakeRouter.emit( 'route', {
		path: 'parent'
	} );
	assert.strictEqual( fakeOverlay.hide.callCount, 1, 'hide child' );
	assert.strictEqual( parentFakeOverlay.show.callCount, 2, 'show parent again' );

	assert.strictEqual( parentFactoryStub.callCount, 1, 'create parent only once' );
} );

QUnit.test( 'prevent route change', function ( assert ) {
	var
		fakeOverlay = this.createFakeOverlay( {
			hide: sandbox.stub().returns( false )
		} ),
		factoryStub = sandbox.stub().returns( fakeOverlay ),
		ev = {
			path: '',
			preventDefault: sandbox.spy()
		};

	overlayManager.add( /^rob$/, factoryStub );

	fakeRouter.emit( 'route', {
		path: 'rob'
	} );
	fakeRouter.emit( 'route', ev );
	assert.strictEqual( ev.preventDefault.called, false,
		'Previously extending hide could prevent closes, this behaviour changed in I2668b6e54a6d54e820d60e4b56028338908ad55f' );
} );

QUnit.test( 'stack increases and decreases at right times', function ( assert ) {
	var self = this;

	overlayManager.add( /^test\/(\d+)$/, function () {
		return self.createFakeOverlay();
	} );
	fakeRouter.emit( 'route', {
		path: 'test/0'
	} );

	assert.strictEqual( overlayManager.stack.length, 1, 'stack is correct size' );

	fakeRouter.emit( 'route', {
		path: 'test/1'
	} );

	assert.strictEqual( overlayManager.stack.length, 2, 'stack is correct size' );

	fakeRouter.emit( 'route', {
		path: 'test/0'
	} );

	assert.strictEqual( overlayManager.stack.length, 1, 'stack decreases when going back to already visited overlay' );
} );

QUnit.test( 'replace overlay when route event path is equal to current path', function ( assert ) {
	var self = this;

	overlayManager.add( /^test\/(\d+)$/, function () {
		return self.createFakeOverlay();
	} );
	fakeRouter.emit( 'route', {
		path: 'test/0'
	} );

	assert.strictEqual( overlayManager.stack.length, 1, 'stack is correct size' );

	fakeRouter.emit( 'route', {
		path: 'test/0'
	} );

	assert.strictEqual( overlayManager.stack.length, 1, 'stack is correct size (did not increase upon reload)' );
} );
