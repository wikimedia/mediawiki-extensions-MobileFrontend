( function ( M ) {
	var util = M.require( 'mobile.startup/util' ),
		ImageGateway = M.require( 'mobile.mediaViewer/ImageGateway' ),
		findSizeBucket = ImageGateway._findSizeBucket;

	QUnit.module( 'MobileFrontend mobile.mediaViewer/mediaViewer' );

	QUnit.test( '#findSizeBucket', function ( assert ) {
		assert.strictEqual( findSizeBucket( 300 ), 320, 'value lower than bucket' );
		assert.strictEqual( findSizeBucket( 800 ), 800, 'exact value' );
		assert.strictEqual( findSizeBucket( 9999 ), 2880, 'value greater than last bucket' );
	} );

	QUnit.test( 'ImageGateway#getThumb (missing page)', function ( assert ) {
		var gateway,
			api = {
				get: function () {
					return util.Deferred().resolve( {
						query: {
							pages: [
								{
									title: 'Hello',
									missing: true
								}
							]
						}
					} );
				}
			};
		gateway = new ImageGateway( { api: api } );
		assert.rejects(
			gateway.getThumb( 'Missing' ),
			function ( err ) {
				return err.message.indexOf( 'The API failed' ) !== -1;
			},
			'A missing page throws an error which the client must handle'
		);
	} );

}( mw.mobileFrontend ) );
