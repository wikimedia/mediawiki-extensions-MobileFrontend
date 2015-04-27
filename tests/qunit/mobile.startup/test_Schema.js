( function ( $, M ) {
	var Schema = M.require( 'Schema' );

	QUnit.module( 'Schema' );

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
