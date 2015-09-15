( function ( $, M ) {

	var WatchstarGateway = M.require( 'mobile.watchstar/WatchstarGateway' ),
		Page = M.require( 'mobile.startup/Page' );

	QUnit.module( 'MobileFrontend: WatchstarGateway.js' );

	QUnit.test( '_loadIntoCache', 2, function ( assert ) {
		var gateway = new WatchstarGateway( new mw.Api() );
		gateway._loadIntoCache( {
			query: {
				pages: {
					19: {},
					30: {
						watched: ''
					}
				}
			}
		} );
		assert.strictEqual( gateway.isWatchedPage( new Page( {
			id: 30
		} ) ), true, 'Able to check watch status' );
		assert.strictEqual( gateway.isWatchedPage( new Page( {
			id: 19
		} ) ), false, 'Able to check watch status' );
	} );

	QUnit.test( 'isWatchedPage', 1, function ( assert ) {
		var gateway = new WatchstarGateway( new mw.Api() );
		assert.ok(
			gateway.isWatchedPage(
				new Page( {
					id: 3000
				} )
			) === undefined,
			'unloaded pages are marked as undefined' );
	} );

}( jQuery, mw.mobileFrontend ) );
