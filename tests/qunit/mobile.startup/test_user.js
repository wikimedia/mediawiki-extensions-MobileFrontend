( function ( M ) {
	var user = M.require( 'mobile.startup/user' );

	QUnit.module( 'MobileFrontend user.js' );

	QUnit.test( '#getSessionId', function ( assert ) {
		var sessionId = user.getSessionId();

		assert.strictEqual( typeof sessionId, 'string', 'session ID is a string' );
		assert.strictEqual( user.getSessionId(), sessionId, 'session ID is reused if present' );
	} );

}( mw.mobileFrontend ) );
