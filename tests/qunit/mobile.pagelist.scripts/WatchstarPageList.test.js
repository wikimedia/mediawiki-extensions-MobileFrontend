( function ( M ) {

	var
		WatchstarPageList = M.require( 'mobile.pagelist.scripts/WatchstarPageList' ),
		user = M.require( 'mobile.startup/user' ),
		util = M.require( 'mobile.startup/util' ),
		Icon = M.require( 'mobile.startup/Icon' ),
		watchIconName = new Icon( {
			name: 'watched'
		} ).getGlyphClassName();

	QUnit.module( 'MobileFrontend mobile.pagelist.scripts/WatchstarPageList', {
		beforeEach: function () {
			var
				resp = {
					query: {
						pages: [ {
							pageid: 30,
							title: 'Title 30',
							watched: true
						}, {
							pageid: 50,
							title: 'Title 50',
							watched: false
						} ]
					}
				};

			// stub out the watchstar call
			this.spy = this.sandbox.stub( mw.Api.prototype, 'get' )
				.returns( util.Deferred().resolve( resp ) );
			this.sandbox.stub( user, 'isAnon' ).returns( false );
		}
	} );

	QUnit.test( 'Watchlist status check if no ids', function ( assert ) {
		var
			done = assert.async(),
			self = this,
			pageList = new WatchstarPageList( {
				api: new mw.Api(),
				pages: [
					{ title: 'Title 0' },
					{ title: 'Title 1' }
				]
			} );

		// Wait for an internal API call to happen as a side-effect of construction.
		window.setTimeout( function () {
			pageList.getPages( [], [] ).then( function () {
				assert.ok( self.spy.calledWith( {
					formatversion: 2,
					action: 'query',
					prop: 'info',
					inprop: 'watched',
					titles: [ 'Title 0', 'Title 1' ]
				} ), 'A request to API was made to retrieve the statuses' );
				assert.strictEqual( pageList.$el.find( '.watch-this-article' ).length, 2, '2 articles have watch stars' );
				done();
			} );
		}, 2000 );
	} );

	QUnit.test( 'Checks watchlist status once', function ( assert ) {
		var
			done = assert.async(),
			self = this,
			pl = new WatchstarPageList( {
				api: new mw.Api(),
				pages: [ {
					id: 30,
					title: 'Title 30'
				}, {
					id: 50,
					title: 'Title 50'
				} ]
			} );
		// Wait for an internal API call to happen as a side-effect of construction.
		setTimeout( function () {
			pl.getPages( [ 30, 50 ], [] ).then( function () {
				assert.strictEqual( self.spy.callCount, 2,
					'run callback twice (inside postRender and this call) - no caching occurs' );
				assert.ok( self.spy.calledWith( {
					formatversion: 2,
					action: 'query',
					prop: 'info',
					inprop: 'watched',
					pageids: [ 30, 50 ]
				} ), 'A request to API was made to retrieve the statuses' );
				assert.strictEqual( pl.$el.find( '.watch-this-article' ).length, 2, '2 articles have watch stars' );
				assert.strictEqual( pl.$el.find( '.' + watchIconName ).length, 1, '1 article is marked as watched' );
				done();
			} );
		}, 2000 );
	} );

}( mw.mobileFrontend ) );
