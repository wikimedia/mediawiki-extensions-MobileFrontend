( function( M, $ ) {

	var
		OverlayManager = M.require( 'OverlayManager' ),
		EventEmitter = M.require( 'eventemitter' ),
		fakeRouter, overlayManager;

	function createFakeOverlay( options ) {
		var fakeOverlay = new EventEmitter();
		fakeOverlay.show = sinon.spy();
		fakeOverlay.hide = sinon.stub().returns( true );
		$.extend( fakeOverlay, options );
		return fakeOverlay;
	}

	QUnit.module( 'MobileFrontend OverlayManager', {
		setup: function() {
			fakeRouter = new EventEmitter();
			fakeRouter.getPath = sinon.stub().returns( '' );
			overlayManager = new OverlayManager( fakeRouter );
		}
	} );

	QUnit.test( '#add', 1, function( assert ) {
		var fakeOverlay = createFakeOverlay();

		overlayManager.add( /^test$/, function() {
			return fakeOverlay;
		} );
		fakeRouter.emit( 'route', $.Event( 'route', { path: 'test' } ) );

		assert.ok( fakeOverlay.show.calledOnce, 'show registered overlay' );
	} );

	QUnit.test( '#add, with $.Deferred factory', 2, function( assert ) {
		var deferred = $.Deferred(), fakeOverlay = createFakeOverlay();
		deferred.show = sinon.spy();

		overlayManager.add( /^test$/, function() {
			return deferred;
		} );
		fakeRouter.emit( 'route', $.Event( 'route', { path: 'test' } ) );
		deferred.resolve( fakeOverlay );

		assert.ok( !deferred.show.called, "don't call show on Deferred" );
		assert.ok( fakeOverlay.show.calledOnce, 'show registered overlay' );
	} );

	QUnit.test( '#add, with current path', 1, function( assert ) {
		var fakeOverlay = createFakeOverlay();
		fakeRouter.getPath = sinon.stub().returns( 'test' );

		overlayManager.add( /^test$/, function() {
			return fakeOverlay;
		} );

		assert.ok( fakeOverlay.show.calledOnce, 'show registered overlay' );
	} );

	QUnit.test( 'route with params', 1, function( assert ) {
		var
			fakeOverlay = createFakeOverlay(),
			factoryStub = sinon.stub().returns( fakeOverlay );

		overlayManager.add( /^test\/(\d+)$/, factoryStub );
		fakeRouter.emit( 'route', $.Event( 'route', { path: 'test/123' } ) );

		assert.ok( factoryStub.calledWith( '123' ), 'pass params from the route' );
	} );

	QUnit.test( 'hide when route changes', 3, function( assert ) {
		var
			fakeOverlay = createFakeOverlay(),
			factoryStub = sinon.stub().returns( fakeOverlay );

		overlayManager.add( /^test$/, factoryStub );
		fakeRouter.emit( 'route', $.Event( 'route', { path: 'test' } ) );
		fakeRouter.emit( 'route', $.Event( 'route', { path: '' } ) );
		fakeRouter.emit( 'route', $.Event( 'route', { path: 'test' } ) );
		fakeRouter.emit( 'route', $.Event( 'route', { path: 'other' } ) );

		assert.ok( fakeOverlay.hide.calledTwice, 'hide overlay' );
		assert.ok( fakeOverlay.hide.getCall( 0 ).notCalledWith( true ), "don't force hide (first)" );
		assert.ok( fakeOverlay.hide.getCall( 1 ).notCalledWith( true ), "don't force hide (second)" );
	} );

	QUnit.test( 'stacked overlays', 7, function( assert ) {
		var
			fakeOverlay = createFakeOverlay(),
			factoryStub = sinon.stub().returns( fakeOverlay ),
			parentFakeOverlay = createFakeOverlay(),
			parentFactoryStub = sinon.stub().returns( parentFakeOverlay );

		overlayManager.add( /^parent$/, parentFactoryStub );
		overlayManager.add( /^test$/, factoryStub );

		fakeRouter.emit( 'route', $.Event( 'route', { path: 'parent' } ) );
		assert.ok( parentFakeOverlay.show.calledOnce, 'show parent' );
		fakeRouter.emit( 'route', $.Event( 'route', { path: 'test' } ) );
		assert.ok( parentFakeOverlay.hide.calledOnce, 'hide parent' );
		assert.ok( parentFakeOverlay.hide.calledWith( true ), 'hide parent forcefully (no confirmation)' );
		assert.ok( fakeOverlay.show.calledOnce, 'show child' );
		fakeRouter.emit( 'route', $.Event( 'route', { path: 'parent' } ) );
		assert.ok( fakeOverlay.hide.calledOnce, 'hide child' );
		assert.ok( parentFakeOverlay.show.calledTwice, 'show parent again' );

		assert.ok( parentFactoryStub.calledOnce, 'create parent only once' );
	} );

	QUnit.test( 'prevent route change', 1, function( assert ) {
		var
			fakeOverlay = createFakeOverlay( { hide: sinon.stub().returns( false ) } ),
			factoryStub = sinon.stub().returns( fakeOverlay ),
			ev = $.Event( 'route', { path: '' } );

		overlayManager.add( /^test$/, factoryStub );

		fakeRouter.emit( 'route', $.Event( 'route', { path: 'test' } ) );
		fakeRouter.emit( 'route', ev );
		assert.ok( ev.isDefaultPrevented(), 'prevent route change' );
	} );

}( mw.mobileFrontend, jQuery ) );
