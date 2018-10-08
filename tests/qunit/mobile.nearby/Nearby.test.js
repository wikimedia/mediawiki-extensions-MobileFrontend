( function ( M, $ ) {

	var NearbyGateway = M.require( 'mobile.nearby/NearbyGateway' ),
		api = {
			get: function () {}
		},
		Nearby = M.require( 'mobile.nearby/Nearby' ),
		LocationProvider = M.require( 'mobile.nearby/LocationProvider' );

	QUnit.module( 'MobileFrontend modules/nearby/Nearby (1 - no results)', {
		beforeEach: function () {
			this.spy = this.sandbox.stub( NearbyGateway.prototype, 'getPages' )
				.returns( $.Deferred().resolve( [] ) );
		}
	} );

	QUnit.test( '#render empty list', function ( assert ) {
		var $el = $( '<div>' ), nearby,
			spy = this.spy,
			opts = {
				api: api,
				latitude: 37.7,
				longitude: -122,
				range: 1000,
				el: $el
			};
		nearby = new Nearby( opts );

		return nearby.refresh( opts ).then( function () {
			assert.ok( spy.calledWithMatch( {
				latitude: 37.7,
				longitude: -122
			}, 1000 ), 'Check API got called' );
			assert.strictEqual( $el.find( 'li' ).length, 0, '0 pages render.' );
			assert.strictEqual( $el.find( '.errorbox' ).length, 1, 'Error message shown.' );
			assert.strictEqual( $el.find( '.loading' ).is( ':visible' ), false, 'No loader shown.' );
		} );
	} );

	QUnit.module( 'MobileFrontend modules/nearby/Nearby (2 - has results)', {
		beforeEach: function () {
			var resp = {
				query: {
					pages: [
						{
							pageid: 2,
							watched: true
						},
						{
							pageid: 3,
							watched: false
						},
						{
							pageid: 4,
							watched: false
						}
					]
				}
			};
			// prevent hits to api due to watch status lookup
			this.sandbox.stub( api, 'get' ).returns( $.Deferred().resolve( resp ) );

			this.getLocation = this.sandbox.stub( LocationProvider, 'getCurrentPosition' )
				.returns( $.Deferred().resolve( {
					latitude: 37.7,
					longitude: -122
				} ) );
			this.spy = this.sandbox.stub( NearbyGateway.prototype, 'getPages' )
				.returns( $.Deferred().resolve( [
					{
						title: 'Sutro Tower',
						id: 2
					},
					{
						title: 'Golden Gate bridge',
						id: 3
					},
					{
						title: 'Golden Gate Park',
						id: 4
					}
				] ) );
		}
	} );

	QUnit.test( '#render with a location', function ( assert ) {
		var $el = $( '<div>' ), nearby,
			spy = this.spy,
			opts = {
				api: api,
				latitude: 37.7,
				longitude: -122,
				range: 1000,
				el: $el
			};

		nearby = new Nearby( opts );
		return nearby.refresh( opts ).then( function () {
			assert.ok( spy.calledWithMatch( {
				latitude: 37.7,
				longitude: -122
			}, 1000 ), 'Check API got called' );
			assert.strictEqual( $el.find( 'li' ).length, 3, '3 pages render.' );
		} );
	} );

	QUnit.module( 'MobileFrontend modules/nearby/Nearby (3 - server errors)', {
		beforeEach: function () {
			this.deferred = $.Deferred();
			this.spy = this.sandbox.stub( NearbyGateway.prototype, 'getPages' )
				.returns( this.deferred.reject() );
		}
	} );

	QUnit.test( '#render with a server error', function ( assert ) {
		var $el = $( '<div>' ),
			spy = this.spy,
			done = assert.async(),
			nearby,
			opts = {
				api: api,
				latitude: 37.7,
				longitude: -122,
				range: 1000,
				el: $el
			};
		nearby = new Nearby( opts );
		return nearby.refresh( opts ).then( function () {
			assert.ok( spy.calledWithMatch( {
				latitude: 37.7,
				longitude: -122
			}, 1000 ), 'Check API got called' );
			assert.strictEqual( $el.find( '.errorbox' ).length, 1, 'Check error got rendered' );
			assert.strictEqual( $el.find( '.errorbox h2' ).text(),
				nearby.errorMessages.http.heading, 'Check it is the correct heading' );
			done();
		} );
	} );

	QUnit.module( 'MobileFrontend modules/nearby/Nearby (4 - Around page)', {
		beforeEach: function () {
			this.spy = this.sandbox.stub( NearbyGateway.prototype, 'getPagesAroundPage' )
				.returns( $.Deferred().reject() );
		}
	} );

	QUnit.test( '#getting a title will trigger a different API method', function ( assert ) {
		var $el = $( '<div>' ),
			pageTitle = 'Hello Friends!',
			nearby,
			opts = {
				api: api,
				pageTitle: pageTitle,
				range: 1000,
				el: $el
			};
		nearby = new Nearby( opts );
		nearby.refresh( opts );
		assert.ok( this.spy.calledWithMatch( pageTitle, 1000 ), 'Check API got called' );
	} );

}( mw.mobileFrontend, jQuery ) );
