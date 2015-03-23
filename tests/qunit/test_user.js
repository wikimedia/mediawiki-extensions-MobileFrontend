( function ( M ) {
	var user = M.require( 'user' );

	QUnit.module( 'MobileFrontend user.js' );

	QUnit.test( '#getSessionId', 3, function ( assert ) {
		var sessionId = user.getSessionId();
		assert.strictEqual( typeof sessionId, 'string', 'session ID is a string' );
		assert.strictEqual( sessionId.length, 16, 'session ID is 16 chars long' );
		assert.strictEqual( user.getSessionId(), sessionId, 'session ID is not regenerated if present' );
	} );

}( mw.mobileFrontend ) );
