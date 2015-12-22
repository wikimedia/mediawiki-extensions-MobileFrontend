( function ( $, M ) {

	var WatchList = M.require( 'mobile.watchlist/WatchList' ),
		user = M.require( 'mobile.user/user' ),
		Icon = M.require( 'mobile.startup/Icon' ),
		watchIcon = new Icon( {
			name: 'watched'
		} );

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

			this.spy = this.sandbox.stub( mw.Api.prototype, 'get' )
				.returns( $.Deferred().resolve( resp ) );
			this.sandbox.stub( user, 'isAnon' ).returns( false );
		}
	} );

	QUnit.test( 'In watched mode', 3, function ( assert ) {
		var pl = new WatchList( {
			api: new mw.Api(),
			pages: [ {
				id: 30
			}, {
				id: 50
			}, {
				id: 60
			} ]
		} );
		// Avoid API requests due to scroll events (https://phabricator.wikimedia.org/T116258)
		pl.infiniteScroll.disable();
		assert.ok( this.spy.notCalled, 'Callback avoided' );
		assert.strictEqual( pl.$el.find( '.watch-this-article' ).length, 3, '3 articles have watch stars...' );
		assert.strictEqual( pl.$el.find( '.' + watchIcon.getGlyphClassName() ).length, 3, '...and all are marked as watched.' );
	} );

}( jQuery, mw.mobileFrontend ) );
