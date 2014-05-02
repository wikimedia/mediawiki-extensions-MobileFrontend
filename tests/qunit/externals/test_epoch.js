( function( H, $ ) {
	QUnit.module( 'epoch.js', {
		setup: function() {
			this.sandbox.stub( window.history, 'pushState' );
			this.sandbox.stub( window.history, 'replaceState' );
			H._enable();
		}
	} );

	QUnit.test( '#isBrowserSupported', function( assert ) {
		var i, tests = [
			[ false, 'Mozilla/5.0(iPad; U; CPU iPhone OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7B314 Safari/531.21.10gin_lib.cc' ],
			[ true, 'Mozilla/5.0 (iPhone; CPU iPhone OS 5_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A334 Safari/7534.48.3' ]
		];
		QUnit.expect( tests.length );
		for ( i = 0; i < tests.length; i++ ) {
			assert.strictEqual( H._isBrowserSupported( tests[i][1] ), tests[i][0] );
		}
	} );

	QUnit.test( '#pushState', 3, function( assert ) {
		H.pushState( { a: 1 }, 'Hello world', '/HW' );
		assert.deepEqual( H.getState().data, { a: 1 }, 'check reflected by current state' );
		assert.strictEqual( H.getState().title, 'Hello world', 'check reflected by current state' );
		assert.strictEqual( H.getState().url, '/HW', 'check reflected by current state' );
	} );

	QUnit.test( '#pushState (use pathname)', 1, function( assert ) {
		H.pushState( null, 'current' );
		assert.strictEqual( H.getState().url, window.location.pathname, 'check reflected by path' );
	} );

	QUnit.test( '#replaceState (fires event)', 1, function( assert ) {
		var statechanges = 0;
		$( window ).one( 'statechange', function() {
			statechanges += 1;
		} );
		H.replaceState( null, 'current' );
		assert.strictEqual( statechanges, 1, 'A statechange event was triggered' );
	} );

	QUnit.test( '#replaceState (unicode characters, bug 49647)', 1, function( assert ) {
		H.replaceState( null, 'current', '/Crêpe' );
		assert.strictEqual( H.getState().url, '/Crêpe', 'Url saved without encoding issues' );
	} );

}( window.History, jQuery ) );
