( function ( M, $ ) {
	var
		OverlayManager = M.require( 'OverlayManager' ),
		EventEmitter = M.require( 'eventemitter' ),
		fakeRouter, overlayManager;

	QUnit.module( 'MobileFrontend OverlayManager', {
		setup: function () {
			this.createFakeOverlay = function ( options ) {
				var fakeOverlay = new EventEmitter();
				fakeOverlay.show = this.sandbox.spy();
				fakeOverlay.hide = function () {
					this.emit( 'hide' );
					return true;
				};
				this.sandbox.spy( fakeOverlay, 'hide' );
				$.extend( fakeOverlay, options );
				return fakeOverlay;
			};

			fakeRouter = new EventEmitter();
			fakeRouter.getPath = this.sandbox.stub().returns( '' );
			fakeRouter.back = this.sandbox.spy();
			overlayManager = new OverlayManager( fakeRouter );
		}
	} );

	QUnit.test( '#add', 1, function ( assert ) {
		var fakeOverlay = this.createFakeOverlay();

		overlayManager.add( /^test$/, function () {
			return fakeOverlay;
		} );
		fakeRouter.emit( 'route', $.Event( 'route', {
			path: 'test'
		} ) );

		assert.ok( fakeOverlay.show.calledOnce, 'show registered overlay' );
	} );

	QUnit.test( '#add, with $.Deferred factory', 2, function ( assert ) {
		var deferred = $.Deferred(),
			fakeOverlay = this.createFakeOverlay();
		deferred.show = this.sandbox.spy();

		overlayManager.add( /^test$/, function () {
			return deferred;
		} );
		fakeRouter.emit( 'route', $.Event( 'route', {
			path: 'test'
		} ) );
		deferred.resolve( fakeOverlay );

		assert.ok( !deferred.show.called, 'don\'t call show on Deferred' );
		assert.ok( fakeOverlay.show.calledOnce, 'show registered overlay' );
	} );

	QUnit.test( '#add, with current path', 1, function ( assert ) {
		var fakeOverlay = this.createFakeOverlay();
		fakeRouter.getPath = this.sandbox.stub().returns( 'test' );

		overlayManager.add( /^test$/, function () {
			return fakeOverlay;
		} );

		assert.ok( fakeOverlay.show.calledOnce, 'show registered overlay' );
	} );

	QUnit.test( '#replaceCurrent', 3, function ( assert ) {
		var fakeOverlay = this.createFakeOverlay(),
			anotherFakeOverlay = this.createFakeOverlay();

		overlayManager.add( /^test$/, function () {
			return fakeOverlay;
		} );

		fakeRouter.emit( 'route', $.Event( 'route', {
			path: 'test'
		} ) );
		overlayManager.replaceCurrent( anotherFakeOverlay );
		assert.ok( fakeOverlay.hide.calledOnce, 'hide overlay' );
		assert.ok( anotherFakeOverlay.show.calledOnce, 'show another overlay' );
		fakeRouter.emit( 'route', $.Event( 'route', {
			path: ''
		} ) );
		assert.ok( anotherFakeOverlay.hide.calledOnce, 'hide another overlay' );
	} );

	QUnit.test( 'route with params', 1, function ( assert ) {
		var
			fakeOverlay = this.createFakeOverlay(),
			factoryStub = this.sandbox.stub().returns( fakeOverlay );

		overlayManager.add( /^test\/(\d+)$/, factoryStub );
		fakeRouter.emit( 'route', $.Event( 'route', {
			path: 'test/123'
		} ) );

		assert.ok( factoryStub.calledWith( '123' ), 'pass params from the route' );
	} );

	QUnit.test( 'hide when route changes', 3, function ( assert ) {
		var
			fakeOverlay = this.createFakeOverlay(),
			factoryStub = this.sandbox.stub().returns( fakeOverlay );

		overlayManager.add( /^test$/, factoryStub );
		fakeRouter.emit( 'route', $.Event( 'route', {
			path: 'test'
		} ) );
		fakeRouter.emit( 'route', $.Event( 'route', {
			path: ''
		} ) );
		fakeRouter.emit( 'route', $.Event( 'route', {
			path: 'test'
		} ) );
		fakeRouter.emit( 'route', $.Event( 'route', {
			path: 'other'
		} ) );

		assert.ok( fakeOverlay.hide.calledTwice, 'hide overlay' );
		assert.ok( fakeOverlay.hide.getCall( 0 ).notCalledWith( true ), 'don\'t force hide (first)' );
		assert.ok( fakeOverlay.hide.getCall( 1 ).notCalledWith( true ), 'don\'t force hide (second)' );
	} );

	QUnit.test( 'go back (change route) if overlay hidden but not by route change', 1, function ( assert ) {
		var
			fakeOverlay = this.createFakeOverlay(),
			factoryStub = this.sandbox.stub().returns( fakeOverlay );

		overlayManager.add( /^test$/, factoryStub );
		fakeRouter.emit( 'route', $.Event( 'route', {
			path: 'test'
		} ) );
		fakeOverlay.hide();

		assert.ok( fakeRouter.back.calledOnce, 'route back' );
	} );

	QUnit.test( 'stacked overlays', 7, function ( assert ) {
		var
			fakeOverlay = this.createFakeOverlay(),
			factoryStub = this.sandbox.stub().returns( fakeOverlay ),
			parentFakeOverlay = this.createFakeOverlay(),
			parentFactoryStub = this.sandbox.stub().returns( parentFakeOverlay );

		overlayManager.add( /^parent$/, parentFactoryStub );
		overlayManager.add( /^test$/, factoryStub );

		fakeRouter.emit( 'route', $.Event( 'route', {
			path: 'parent'
		} ) );
		assert.ok( parentFakeOverlay.show.calledOnce, 'show parent' );
		fakeRouter.emit( 'route', $.Event( 'route', {
			path: 'test'
		} ) );
		assert.ok( parentFakeOverlay.hide.calledOnce, 'hide parent' );
		assert.ok( parentFakeOverlay.hide.calledWith( true ), 'hide parent forcefully (no confirmation)' );
		assert.ok( fakeOverlay.show.calledOnce, 'show child' );
		fakeRouter.emit( 'route', $.Event( 'route', {
			path: 'parent'
		} ) );
		assert.ok( fakeOverlay.hide.calledOnce, 'hide child' );
		assert.ok( parentFakeOverlay.show.calledTwice, 'show parent again' );

		assert.ok( parentFactoryStub.calledOnce, 'create parent only once' );
	} );

	QUnit.test( 'prevent route change', 1, function ( assert ) {
		var
			fakeOverlay = this.createFakeOverlay( {
				hide: this.sandbox.stub().returns( false )
			} ),
			factoryStub = this.sandbox.stub().returns( fakeOverlay ),
			ev = $.Event( 'route', {
				path: ''
			} );

		overlayManager.add( /^test$/, factoryStub );

		fakeRouter.emit( 'route', $.Event( 'route', {
			path: 'test'
		} ) );
		fakeRouter.emit( 'route', ev );
		assert.ok( ev.isDefaultPrevented(), 'prevent route change' );
	} );
}( mw.mobileFrontend, jQuery ) );
