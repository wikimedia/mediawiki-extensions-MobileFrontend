( function ( $, M ) {
	var Schema = M.require( 'Schema' );

	QUnit.module( 'Schema' );

	QUnit.test( '#getSessionId', 3, function ( assert ) {
		var sessionId = Schema.getSessionId();
		assert.strictEqual( typeof sessionId, 'string', 'session ID is a string' );
		assert.strictEqual( sessionId.length, 32, 'session ID is 32 chars long' );
		assert.strictEqual( Schema.getSessionId(), sessionId, 'session ID is not regenerated if present' );
	} );

	QUnit.test( '#initialize', 3, function ( assert ) {
		var s1, s2, s3, SubSchema;
		// Creating a schema without name throws
		try {
			s1 = new Schema();
		} catch ( ex ) {
			assert.ok( true );
		}

		s2 = new Schema( {}, 'aname' );
		assert.strictEqual( s2.name, 'aname', 'explicit name gets set' );

		SubSchema = Schema.extend( {
			name: 'subname'
		} );
		s3 = new SubSchema( {} );
		assert.strictEqual( s3.name, 'subname', 'subclassed name works' );
	} );

}( jQuery, mw.mobileFrontend ) );
