( function ( M ) {

	var WatchList = M.require( 'mobile.watchlist/WatchList' ),
		user = M.require( 'mobile.startup/user' ),
		Icon = M.require( 'mobile.startup/Icon' ),
		watchIconName = new Icon( {
			name: 'watched'
		} ).getGlyphClassName();

	QUnit.module( 'MobileFrontend modules/WatchList', {
		beforeEach: function () {
			this.spy = this.sandbox.stub( mw.Api.prototype, 'get' );
			this.sandbox.stub( user, 'isAnon' ).returns( false );
		}
	} );

	QUnit.test( 'In watched mode', function ( assert ) {
		var
			done = assert.async(),
			spy = this.spy,
			pl = new WatchList( {
				api: new mw.Api(),
				pages: [
					{ title: 'Title 30' },
					{ title: 'Title 50' },
					{
						title: 'Title 60',
						watched: true
					}
				]
			} );
		// Avoid API requests due to scroll events (https://phabricator.wikimedia.org/T116258)
		pl.scrollEndEventEmitter.disable();

		// Wait for an internal API call to happen as a side-effect of construction.
		window.setTimeout( function () {
			assert.ok( spy.notCalled, 'Callback avoided' );
			assert.strictEqual( pl.$el.find( '.watch-this-article' ).length, 3, '3 articles have watch stars...' );
			assert.strictEqual( pl.$el.find( '.' + watchIconName ).length, 3, '...and all are marked as watched.' );
			done();
		}, 2000 );
	} );

}( mw.mobileFrontend ) );
