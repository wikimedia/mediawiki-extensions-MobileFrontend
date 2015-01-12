( function ( $, M ) {

	var PageList = M.require( 'modules/PageList' ),
		user = M.require( 'user' ),
		Icon = M.require( 'Icon' ),
		watchIcon = new Icon( {
			name: 'watched'
		} ),
		WatchstarApi = M.require( 'modules/watchstar/WatchstarApi' );

	QUnit.module( 'MobileFrontend modules/PageList', {
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

	QUnit.test( 'Checks watchlist status once', 4, function ( assert ) {
		var pl = new PageList( {
			pages: [ {
				id: 30
			}, {
				id: 50
			} ]
		} );
		assert.ok( this.spy.calledOnce, 'run callback once' );
		assert.ok( this.spy.calledWith( {
			action: 'query',
			prop: 'info',
			inprop: 'watched',
			pageids: [ 30, 50 ]
		} ), 'A request to API was made to retrieve the statuses' );
		assert.strictEqual( pl.$el.find( '.watch-this-article' ).length, 2, '2 articles have watch stars' );
		assert.strictEqual( pl.$el.find( '.' + watchIcon.getGlyphClassName() ).length, 1, '1 of articles is marked as watched' );
	} );

}( jQuery, mw.mobileFrontend ) );
