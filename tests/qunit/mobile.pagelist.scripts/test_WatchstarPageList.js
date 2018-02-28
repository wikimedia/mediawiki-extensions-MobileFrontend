( function ( $, M ) {

	var PageList = M.require( 'mobile.pagelist.scripts/WatchstarPageList' ),
		user = M.require( 'mobile.startup/user' ),
		Icon = M.require( 'mobile.startup/Icon' ),
		watchIcon = new Icon( {
			name: 'watched'
		} );

	QUnit.module( 'MobileFrontend mobile.pagelist.scripts/WatchstarPageList', {
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

			// stub out the watchstar call
			this.spy = this.sandbox.stub( mw.Api.prototype, 'get' )
				.returns( $.Deferred().resolve( resp ) );
			this.sandbox.stub( user, 'isAnon' ).returns( false );
		}
	} );

	QUnit.test( 'No watchlist status check if no ids', function ( assert ) {
		var pl,
			spy = this.spy;
		pl = new PageList( {
			api: new mw.Api(),
			pages: [ {}, {} ]
		} );
		return pl.getPages().done( function () {
			assert.ok( spy.calledOnce,
				'A request to API was made for pages but not watch status' );
			assert.strictEqual( pl.$el.find( '.watch-this-article' ).length, 0, '0 articles have watch stars' );
		} );
	} );

	QUnit.test( 'Checks watchlist status once', function ( assert ) {
		var pl,
			spy = this.spy;
		pl = new PageList( {
			api: new mw.Api(),
			pages: [ {
				id: 30
			}, {
				id: 50
			} ]
		} );
		return pl.getPages().done( function () {
			assert.ok( spy.calledTwice,
				'run callback twice (inside postRender and this call) - no caching occurs' );
			assert.ok( spy.calledWith( {
				action: 'query',
				prop: 'info',
				inprop: 'watched',
				pageids: [ 30, 50 ]
			} ), 'A request to API was made to retrieve the statuses' );
			assert.strictEqual( pl.$el.find( '.watch-this-article' ).length, 2, '2 articles have watch stars' );
			assert.strictEqual( pl.$el.find( '.' + watchIcon.getGlyphClassName() ).length, 1, '1 of articles is marked as watched' );
		} );
	} );

}( jQuery, mw.mobileFrontend ) );
