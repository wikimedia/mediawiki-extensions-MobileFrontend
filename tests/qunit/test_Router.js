( function ( M, $ ) {
	var Router = M.require( 'Router' ),
		hashQueue = [],
		interval, router;

	// we can't change hash too quickly because hashchange callbacks are async
	// (don't fire immediately after the hash is changed) and all the callbacks
	// would get the same (latest) hash; see setup and teardown too
	function setHash( hash ) {
		hashQueue.push( hash );
	}

	QUnit.module( 'MobileFrontend Router', {
		setup: function () {
			router = new Router();
			interval = setInterval( function () {
				var hash = hashQueue.pop();
				if ( hash !== undefined ) {
					window.location.hash = hash;
				}
			}, 10 );
		},

		teardown: function () {
			// hashchange is async, we need to wait
			$( window ).one( 'hashchange.test', function () {
				$( window ).off( 'hashchange.test' );
				clearInterval( interval );
				QUnit.start();
			} );
			setHash( '' );
			QUnit.stop();
		}
	} );

	QUnit.asyncTest( '#route, string', 1, function ( assert ) {
		router.route( 'teststring', function () {
			assert.ok( true, 'run callback for route' );
			QUnit.start();
		} );
		setHash( '#teststring' );
	} );

	QUnit.asyncTest( '#route, RegExp', 1, function ( assert ) {
		router.route( /^testre-(\d+)$/, function ( param ) {
			assert.strictEqual( param, '123', 'run callback for route with correct params' );
			QUnit.start();
		} );
		setHash( '#testre-abc' );
		setHash( '#testre-123' );
	} );

	QUnit.asyncTest( 'on route', 2, function ( assert ) {
		var count = 0,
			spy = this.sandbox.spy();

		router.route( 'testprevent', spy );

		// try preventing second route (#testprevent)
		router.once( 'route', function () {
			setHash( '#testprevent' );
			router.once( 'route', function ( ev ) {
				ev.preventDefault();
			} );
		} );
		setHash( '#initial' );

		$( window ).on( 'hashchange.test', function () {
			++count;
			if ( count === 3 ) {
				assert.strictEqual( window.location.hash, '#initial', 'reset hash' );
				assert.ok( !spy.called, 'don\'t run callback for prevented route' );
				QUnit.start();
			}
		} );
	} );

	QUnit.asyncTest( 'on back', 2, function ( assert ) {
		router.back().done( function () {
			assert.ok( true, 'back 1 complete' );
		} );
		router.back().done( function () {
			assert.ok( true, 'back 2 complete' );
		} );
		QUnit.start();
	} );

	QUnit.test( 'on back without popstate', 2, function ( assert ) {
		var historyStub = this.sandbox.stub( window.history, 'back' );  // do not emit popstate

		router.on( 'popstate', function () {
			assert.ok( false, 'this assertion is not supposed to get called' );
		} );

		router.back().done( function () {
			assert.ok( historyStub.called, 'history back has been called' );
			assert.ok( true, 'back without popstate complete' );
			QUnit.start();
		} );
	} );

}( mw.mobileFrontend, jQuery ) );
