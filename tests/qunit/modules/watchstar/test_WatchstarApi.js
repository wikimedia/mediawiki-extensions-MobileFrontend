( function ( $, M ) {

	var WatchstarApi = M.require( 'modules/watchstar/WatchstarApi' ),
		Page = M.require( 'Page' );

	QUnit.module( 'MobileFrontend: WatchstarApi.js' );

	QUnit.test( '_loadIntoCache', 2, function ( assert ) {
		var api = new WatchstarApi();
		api._loadIntoCache( {
			query: {
				pages: {
					19: {},
					30: {
						watched: ''
					}
				}
			}
		} );
		assert.strictEqual( api.isWatchedPage( new Page( {
			id: 30
		} ) ), true, 'Able to check watch status' );
		assert.strictEqual( api.isWatchedPage( new Page( {
			id: 19
		} ) ), false, 'Able to check watch status' );
	} );

	QUnit.test( 'isWatchedPage', 1, function ( assert ) {
		var api = new WatchstarApi();
		assert.throws( function () {
			api.isWatchedPage( new Page( {
				id: 3000
			} ) );
		}, 'throws an exception' );
	} );

}( jQuery, mw.mobileFrontend ) );
