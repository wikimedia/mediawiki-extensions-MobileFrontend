( function ( M ) {
	var user = M.require( 'user' );

	QUnit.module( 'MobileFrontend user.js' );

	QUnit.test( '#getSessionId', 2, function ( assert ) {
		var sessionId = user.getSessionId();
		assert.strictEqual( typeof sessionId, 'string', 'session ID is a string' );
		assert.strictEqual( user.getSessionId(), sessionId, 'session ID is not regenerated if present' );
	} );

}( mw.mobileFrontend ) );
