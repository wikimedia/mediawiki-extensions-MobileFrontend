( function( M, $ ) {
	var Router = M.require( 'Router' ), router;

	QUnit.module( 'MobileFrontend Router', {
		setup: function() {
			router = new Router();
		},

		teardown: function() {
			// hashchange is async, we need to wait
			$( window ).one( 'hashchange.test', function() {
				$( window ).off( 'hashchange.test' );
				QUnit.start();
			} );
			window.location.hash = '';
			QUnit.stop();
		}
	} );

	QUnit.asyncTest( '#route, string', 1, function( assert ) {
		router.route( 'teststring', function() {
			assert.ok( true, 'run callback for route' );
			QUnit.start();
		} );
		window.location.hash = '#teststring';
	} );

	QUnit.asyncTest( '#route, RegExp', 1, function( assert ) {
		router.route( /testre-(\d+)/, function( param ) {
			assert.strictEqual( param, '123', 'run callback for route with correct params' );
			QUnit.start();
		} );
		window.location.hash = '#testre-abc';
		window.location.hash = '#testre-123';
	} );

	QUnit.asyncTest( 'on route', 2, function( assert ) {
		var count = 0, spy = sinon.spy();

		router.route( 'testprevent', spy );

		// try preventing second route (#testprevent)
		router.one( 'route', function() {
			router.one( 'route', function( ev ) {
				ev.preventDefault();
			} );
		} );
		window.location.hash = '#initial';
		window.location.hash = '#testprevent';

		$( window ).on( 'hashchange.test', function() {
			++count;
			if ( count === 3 ) {
				assert.strictEqual( window.location.hash, '#initial', 'reset hash' );
				assert.ok( !spy.called, "don't run callback for prevented route" );
				QUnit.start();
			}
		} );
	} );

}( mw.mobileFrontend, jQuery ) );
