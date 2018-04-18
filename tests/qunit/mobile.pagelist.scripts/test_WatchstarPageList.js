( function ( $, M ) {

	var WatchstarPageList = M.require( 'mobile.pagelist.scripts/WatchstarPageList' ),
		user = M.require( 'mobile.startup/user' ),
		Icon = M.require( 'mobile.startup/Icon' ),
		watchIcon = new Icon( {
			name: 'watched'
		} );

	QUnit.module( 'MobileFrontend mobile.pagelist.scripts/WatchstarPageList', {
		setup: function () {
			var resp = {
				query: {
					pages: [
						{
							pageid: 30,
							title: 'Title 30',
							watched: true
						},
						{
							pageid: 50,
							title: 'Title 50',
							watched: false
						}
					]
				}
			};

			// stub out the watchstar call
			this.spy = this.sandbox.stub( mw.Api.prototype, 'get' )
				.returns( $.Deferred().resolve( resp ) );
			this.sandbox.stub( user, 'isAnon' ).returns( false );
		}
	} );

	QUnit.test( 'Watchlist status check if no ids', function ( assert ) {
		var done = assert.async(),
			pl,
			spy = this.spy;
		pl = new WatchstarPageList( {
			api: new mw.Api(),
			pages: [
				{ title: 'Title 0' },
				{ title: 'Title 1' }
			]
		} );

		// Wait for an internal API call to happen as a side-effect of construction.
		window.setTimeout( function () {
			pl.getPages( {} ).done( function () {
				assert.ok( spy.calledWith( {
					formatversion: 2,
					action: 'query',
					prop: 'info',
					inprop: 'watched',
					titles: [ 'Title 0', 'Title 1' ]
				} ), 'A request to API was made to retrieve the statuses' );
				assert.strictEqual( pl.$el.find( '.watch-this-article' ).length, 2, '2 articles have watch stars' );
				done();
			} );
		}, 2000 );
	} );

	QUnit.test( 'Checks watchlist status once', function ( assert ) {
		var done = assert.async(),
			spy = this.spy,
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
			pl.getPages( {
				'Title 30': 30,
				'Title 50': 50
			} ).done( function () {
				assert.strictEqual( spy.callCount, 2,
					'run callback twice (inside postRender and this call) - no caching occurs' );
				assert.ok( spy.calledWith( {
					formatversion: 2,
					action: 'query',
					prop: 'info',
					inprop: 'watched',
					pageids: [ 30, 50 ]
				} ), 'A request to API was made to retrieve the statuses' );
				assert.strictEqual( pl.$el.find( '.watch-this-article' ).length, 2, '2 articles have watch stars' );
				assert.strictEqual( pl.$el.find( '.' + watchIcon.getGlyphClassName() ).length, 1, '1 article is marked as watched' );
				done();
			} );
		}, 2000 );
	} );

}( jQuery, mw.mobileFrontend ) );
