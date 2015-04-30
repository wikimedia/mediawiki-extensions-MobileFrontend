( function ( $, M ) {
	var Schema = M.require( 'Schema' ),
		TestSchema = Schema.extend( {
			name: 'test'
		} );

	// Because these can't be undefined, we have to do this in the module
	// preamble (not setup and teardown).
	M.define( 'loggingSchemas/Schematest', TestSchema );

	QUnit.module( 'MobileFrontend: Schema', {
		setup: function () {
			this.stub( TestSchema.prototype, 'log' );
			this.logStub = TestSchema.prototype.log;
		}
	} );

	QUnit.test( '#initialize', 3, function ( assert ) {
		var s1, s2, s3;
		// Creating a schema without name throws
		try {
			s1 = new Schema();
		} catch ( ex ) {
			assert.ok( true );
		}

		s2 = new Schema( {}, 'aname' );
		assert.strictEqual( s2.name, 'aname', 'explicit name gets set' );

		s3 = new TestSchema( {} );
		assert.strictEqual( s3.name, 'test', 'subclassed name works' );
	} );

	QUnit.test( '#flush should log the beacon', 1, function ( assert ) {
		var data = {
				foo: 'bar'
			},
			testSchema = new TestSchema();

		testSchema.logBeacon( data );
		Schema.flushBeacon();

		assert.deepEqual( [ data ], this.logStub.firstCall.args );
	} );

}( jQuery, mw.mobileFrontend ) );
