( function ( M ) {
	var user = M.require( 'mobile.user/user' );

	QUnit.module( 'MobileFrontend user.js' );

	QUnit.test( '#getSessionId', 3, function ( assert ) {
		var spy = this.sandbox.spy( mw.storage, 'remove' ),
			sessionId;

		spy.withArgs( 'sessionId' );

		sessionId = user.getSessionId();

		assert.strictEqual( typeof sessionId, 'string', 'session ID is a string' );
		assert.strictEqual( user.getSessionId(), sessionId, 'session ID is not regenerated if present' );

		assert.ok( spy.calledTwice, 'Any previously stored session ID is removed from storage' );
	} );

}( mw.mobileFrontend ) );
