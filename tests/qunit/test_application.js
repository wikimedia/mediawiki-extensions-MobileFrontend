( function ( $, M ) {
	QUnit.module( 'MobileFrontend modules' );

	QUnit.test( 'define()', 1, function () {
		M.define( 'testModule1', 'test module 1' );
		QUnit.throws(
			function () {
				M.define( 'testModule1', 'again' );
			},
			/already exists/,
			"throws an error when module already exists"
		);
	} );

	QUnit.test( 'require()', 2, function ( assert ) {
		QUnit.throws(
			function () {
				M.require( 'dummy' );
			},
			/not found/,
			"throws an error when module doesn't exist"
		);
		M.define( 'testModule2', 'test module 2' );
		assert.strictEqual( M.require( 'testModule2' ), 'test module 2' );
	} );

	QUnit.module( 'MobileFrontend common functions' );

	QUnit.test( '#getSessionId', 3, function ( assert ) {
		var sessionId = M.getSessionId();
		assert.strictEqual( typeof sessionId, 'string', 'session ID is a string' );
		assert.strictEqual( sessionId.length, 32, 'session ID is 32 chars long' );
		assert.strictEqual( M.getSessionId(), sessionId, 'session ID is not regenerated if present' );
	} );

	QUnit.test( '#getSessionId', 3, function ( assert ) {
		var sessionId = M.getSessionId();
		assert.strictEqual( typeof sessionId, 'string', 'session ID is a string' );
		assert.strictEqual( sessionId.length, 32, 'session ID is 32 chars long' );
		assert.strictEqual( M.getSessionId(), sessionId, 'session ID is not regenerated if present' );
	} );

}( jQuery, mw.mobileFrontend ) );
