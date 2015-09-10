( function ( M ) {
	var findSizeBucket = M.require( 'mobile.mediaViewer/ImageGateway' )._findSizeBucket;

	QUnit.module( 'MobileFrontend mobile.mediaViewer/mediaViewer' );

	QUnit.test( '#findSizeBucket', 3, function ( assert ) {
		assert.strictEqual( findSizeBucket( 300 ), 320, 'value lower than bucket' );
		assert.strictEqual( findSizeBucket( 800 ), 800, 'exact value' );
		assert.strictEqual( findSizeBucket( 9999 ), 2880, 'value greater than last bucket' );
	} );

}( mw.mobileFrontend ) );
