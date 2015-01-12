( function ( $, M ) {

	var WatchList = M.require( 'modules/watchlist/WatchList' ),
		user = M.require( 'user' ),
		Icon = M.require( 'Icon' ),
		watchIcon = new Icon( {
			name: 'watched'
		} ),
		WatchstarApi = M.require( 'modules/watchstar/WatchstarApi' );

	QUnit.module( 'MobileFrontend modules/WatchList', {
		setup: function () {
			var resp = {
				query: {
					pages: {
						30: {
							watched: ''
						},
						50: {}
					}
				}
			};

			this.spy = this.sandbox.stub( WatchstarApi.prototype, 'get' )
				.returns( $.Deferred().resolve( resp ) );
			this.sandbox.stub( user, 'isAnon' ).returns( false );
		}
	} );

	QUnit.test( 'In watched mode', 3, function ( assert ) {
		var pl = new WatchList( {
			pages: [ {
				id: 30
			}, {
				id: 50
			}, {
				id: 60
			} ]
		} );
		assert.ok( this.spy.notCalled, 'Callback avoided' );
		assert.strictEqual( pl.$el.find( '.watch-this-article' ).length, 3, '3 articles have watch stars...' );
		assert.strictEqual( pl.$el.find( '.' + watchIcon.getGlyphClassName() ).length, 3, '...and all are marked as watched.' );
	} );

}( jQuery, mw.mobileFrontend ) );
