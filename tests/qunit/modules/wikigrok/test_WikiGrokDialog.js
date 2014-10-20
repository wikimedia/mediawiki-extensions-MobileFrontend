( function ( $, M ) {

	var WikiGrokDialog = M.require( 'modules/wikigrok/WikiGrokDialog' );

	QUnit.module( 'MobileFrontend: WikiGrokDialog', {
		setup: function() {
		},
		teardown: function() {
		}
	} );

	QUnit.test( 'randomly choose items form array', 7, function( assert ) {
		var array = [],
			chooseRandomItemsFromArray = WikiGrokDialog.prototype.chooseRandomItemsFromArray;

		assert.strictEqual(
			$.isEmptyObject( chooseRandomItemsFromArray( array, 1 ) ),
			true,
			'picking 1 element from an array with 0 elements'
		);

		array = [1];
		assert.strictEqual(
			chooseRandomItemsFromArray( array, 1 ).length,
			1,
			'picking 1 element from an array with 1 element'
		);
		assert.strictEqual(
			chooseRandomItemsFromArray( array, 2 ).length,
			1,
			'picking 2 elements from an array with 1 element'
		);

		array = [4, {3: 2}, ['a', 'b', 0], -1];
		assert.strictEqual(
			chooseRandomItemsFromArray( array, 1 ).length,
			1,
			'picking 1 element from an array with 4 elements'
		);
		assert.strictEqual(
			chooseRandomItemsFromArray( array, 2 ).length,
			2,
			'picking 2 elements from an array with 4 elements'
		);
		assert.strictEqual(
			chooseRandomItemsFromArray( array, 4 ).length,
			4,
			'picking 4 elements from an array with 4 elements'
		);
		assert.strictEqual(
			chooseRandomItemsFromArray( array, 10 ).length,
			4,
			'picking 10 elements from an array with 4 elements'
		);
	} );

}( jQuery, mw.mobileFrontend ) );
