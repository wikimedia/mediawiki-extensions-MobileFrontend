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

}( jQuery, mw.mobileFrontend ) );
