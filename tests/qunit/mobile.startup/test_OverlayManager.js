( function ( M, $ ) {
	var OverlayManager = M.require( 'mobile.startup/OverlayManager' ),
		fakeRouter, overlayManager;

	QUnit.module( 'MobileFrontend mobile.startup/OverlayManager', {
		setup: function () {
			this.createFakeOverlay = function ( options ) {
				var fakeOverlay = new OO.EventEmitter();
				fakeOverlay.show = this.sandbox.spy();
				fakeOverlay.hide = function () {
					this.emit( 'hide' );
					return true;
				};
				this.sandbox.spy( fakeOverlay, 'hide' );
				$.extend( fakeOverlay, options );
				return fakeOverlay;
			};

			fakeRouter = new OO.EventEmitter();
			fakeRouter.getPath = this.sandbox.stub().returns( '' );
			fakeRouter.back = this.sandbox.spy();
			overlayManager = new OverlayManager( fakeRouter );
		}
	} );

	QUnit.test( '#add', function ( assert ) {
		var fakeOverlay = this.createFakeOverlay();

		overlayManager.add( /^test$/, function () {
			return fakeOverlay;
		} );
		fakeRouter.emit( 'route', $.Event( 'route', {
			path: 'test'
		} ) );

		assert.ok( fakeOverlay.show.calledOnce, 'show registered overlay' );
	} );

	QUnit.test( '#add, with $.Deferred factory', function ( assert ) {
		var deferred = $.Deferred(),
			fakeOverlay = this.createFakeOverlay();
		deferred.show = this.sandbox.spy();

		overlayManager.add( /^foo$/, function () {
			return deferred;
		} );
		fakeRouter.emit( 'route', $.Event( 'route', {
			path: 'foo'
		} ) );
		deferred.resolve( fakeOverlay );

		assert.ok( !deferred.show.called, 'don\'t call show on Deferred' );
		assert.ok( fakeOverlay.show.calledOnce, 'show registered overlay' );
	} );

	QUnit.test( '#add, with current path', function ( assert ) {
		var fakeOverlay = this.createFakeOverlay();
		fakeRouter.getPath = this.sandbox.stub().returns( 'baha' );

		overlayManager.add( /^baha$/, function () {
			return fakeOverlay;
		} );

		// Wait for $.ready because OverlayManager#add() does
		return $.when( $.ready ).then( function () {
			assert.ok( fakeOverlay.show.calledOnce, 'show registered overlay' );
		} );
	} );

	QUnit.test( '#replaceCurrent', function ( assert ) {
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

	QUnit.test( 'route with params', function ( assert ) {
		var
			fakeOverlay = this.createFakeOverlay(),
			factoryStub = this.sandbox.stub().returns( fakeOverlay );

		overlayManager.add( /^sam\/(\d+)$/, factoryStub );
		fakeRouter.emit( 'route', $.Event( 'route', {
			path: 'sam/123'
		} ) );

		assert.ok( factoryStub.calledWith( '123' ), 'pass params from the route' );
	} );

	QUnit.test( 'hide when route changes', function ( assert ) {
		var
			fakeOverlay = this.createFakeOverlay(),
			factoryStub = this.sandbox.stub().returns( fakeOverlay );

		overlayManager.add( /^jon$/, factoryStub );
		fakeRouter.emit( 'route', $.Event( 'route', {
			path: 'jon'
		} ) );
		fakeRouter.emit( 'route', $.Event( 'route', {
			path: ''
		} ) );
		fakeRouter.emit( 'route', $.Event( 'route', {
			path: 'jon'
		} ) );
		fakeRouter.emit( 'route', $.Event( 'route', {
			path: 'other'
		} ) );

		assert.ok( fakeOverlay.hide.calledTwice, 'hide overlay' );
		assert.ok( fakeOverlay.hide.getCall( 0 ).notCalledWith( true ), 'don\'t force hide (first)' );
		assert.ok( fakeOverlay.hide.getCall( 1 ).notCalledWith( true ), 'don\'t force hide (second)' );
	} );

	QUnit.test( 'go back (change route) if overlay hidden but not by route change', function ( assert ) {
		var
			fakeOverlay = this.createFakeOverlay(),
			factoryStub = this.sandbox.stub().returns( fakeOverlay );

		overlayManager.add( /^joakino$/, factoryStub );
		fakeRouter.emit( 'route', $.Event( 'route', {
			path: 'joakino'
		} ) );
		fakeOverlay.hide();

		assert.ok( fakeRouter.back.calledOnce, 'route back' );
	} );

	QUnit.test( 'stacked overlays', function ( assert ) {
		var
			fakeOverlay = this.createFakeOverlay(),
			factoryStub = this.sandbox.stub().returns( fakeOverlay ),
			parentFakeOverlay = this.createFakeOverlay(),
			parentFactoryStub = this.sandbox.stub().returns( parentFakeOverlay );

		overlayManager.add( /^parent$/, parentFactoryStub );
		overlayManager.add( /^child$/, factoryStub );

		fakeRouter.emit( 'route', $.Event( 'route', {
			path: 'parent'
		} ) );
		assert.ok( parentFakeOverlay.show.calledOnce, 'show parent' );
		fakeRouter.emit( 'route', $.Event( 'route', {
			path: 'child'
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

	QUnit.test( 'prevent route change', function ( assert ) {
		var
			fakeOverlay = this.createFakeOverlay( {
				hide: this.sandbox.stub().returns( false )
			} ),
			factoryStub = this.sandbox.stub().returns( fakeOverlay ),
			ev = $.Event( 'route', {
				path: ''
			} );

		overlayManager.add( /^rob$/, factoryStub );

		fakeRouter.emit( 'route', $.Event( 'route', {
			path: 'rob'
		} ) );
		fakeRouter.emit( 'route', ev );
		assert.ok( ev.isDefaultPrevented(), 'prevent route change' );
	} );
}( mw.mobileFrontend, jQuery ) );
