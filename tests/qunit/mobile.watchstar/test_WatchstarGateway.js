( function ( $, M ) {

	var WatchstarGateway = M.require( 'mobile.watchstar/WatchstarGateway' ),
		Page = M.require( 'mobile.startup/Page' );

	QUnit.module( 'MobileFrontend: WatchstarGateway.js' );

	QUnit.test( '_loadIntoCache', function ( assert ) {
		var gateway = new WatchstarGateway( new mw.Api() );
		gateway._loadIntoCache( {
			query: {
				pages: [
					{
						pageid: 19,
						title: 'Title 19',
						watched: false
					},
					{
						pageid: 30,
						title: 'Title 30',
						watched: true
					}
				]
			}
		} );
		assert.strictEqual( gateway.isWatchedPage( new Page( {
			title: 'Title 19'
		} ) ), false, 'Able to check watch status of unwatched page' );
		assert.strictEqual( gateway.isWatchedPage( new Page( {
			title: 'Title 30'
		} ) ), true, 'Able to check watch status of watched page' );
	} );

	QUnit.test( 'isWatchedPage', function ( assert ) {
		var gateway = new WatchstarGateway( new mw.Api() );
		assert.ok(
			gateway.isWatchedPage(
				new Page( {
					title: 'Title'
				} )
			) === undefined,
			'unloaded pages are marked as undefined' );
	} );

}( jQuery, mw.mobileFrontend ) );
