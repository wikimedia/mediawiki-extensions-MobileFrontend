( function ( M, $ ) {

	var NearbyGateway = M.require( 'mobile.nearby/NearbyGateway' ),
		api = new mw.Api(),
		Nearby = M.require( 'mobile.nearby/Nearby' );

	QUnit.module( 'MobileFrontend modules/nearby/Nearby (1 - no results)', {
		setup: function () {
			this.spy = this.sandbox.stub( NearbyGateway.prototype, 'getPages' )
				.returns( $.Deferred().resolve( [] ) );
		}
	} );

	QUnit.test( '#render empty list', function ( assert ) {
		var $el = $( '<div>' );
		// eslint-disable-next-line no-new
		new Nearby( {
			api: api,
			latitude: 37.7,
			longitude: -122,
			range: 1000,
			el: $el
		} );
		assert.ok( this.spy.calledWithMatch( {
			latitude: 37.7,
			longitude: -122
		}, 1000 ), 'Check API got called' );
		assert.strictEqual( $el.find( 'li' ).length, 0, '0 pages render.' );
		assert.strictEqual( $el.find( '.errorbox' ).length, 1, 'Error message shown.' );
		assert.strictEqual( $el.find( '.loading' ).is( ':visible' ), false, 'No loader shown.' );
	} );

	QUnit.module( 'MobileFrontend modules/nearby/Nearby (2 - has results)', {
		setup: function () {
			var resp = {
				query: {
					pages: {
						2: {
							watched: ''
						},
						3: {},
						4: {}
					}
				}
			};
			// prevent hits to api due to watch status lookup
			this.sandbox.stub( mw.Api.prototype, 'get' ).returns( $.Deferred().resolve( resp ) );

			this.getLocation = this.sandbox.stub( Nearby.prototype, 'getCurrentPosition' )
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
		var $el = $( '<div>' );
		// eslint-disable-next-line no-new
		new Nearby( {
			api: api,
			latitude: 37.7,
			longitude: -122,
			range: 1000,
			el: $el
		} );
		assert.ok( this.spy.calledWithMatch( {
			latitude: 37.7,
			longitude: -122
		}, 1000 ), 'Check API got called' );
		assert.strictEqual( $el.find( 'li' ).length, 3, '3 pages render.' );
	} );

	QUnit.test( '#render with location error', function ( assert ) {
		var $el = $( '<div>' ),
			n = new Nearby( {
				range: 1000,
				el: $el,
				errorType: 'locating'
			} );
		assert.ok( this.spy.notCalled, 'Check API didn\'t get called on this case.' );
		assert.strictEqual( $el.find( '.errorbox' ).length, 1, 'Check error got rendered' );
		assert.strictEqual( $el.find( '.errorbox h2' ).length, 1, 'Check error has heading' );
		assert.strictEqual( $el.find( '.errorbox h2' ).text(),
			n.errorMessages.locating.heading, 'Check it is the correct heading' );
	} );

	QUnit.test( '#render with current location', function ( assert ) {
		var $el = $( '<div>' );
		// eslint-disable-next-line no-new
		new Nearby( {
			api: api,
			useCurrentLocation: true,
			range: 1000,
			el: $el
		} );
		assert.ok( this.getLocation.calledOnce, 'Check API got called' );
		assert.strictEqual( $el.find( 'li' ).length, 3, '3 pages render.' );
	} );

	QUnit.module( 'MobileFrontend modules/nearby/Nearby (3 - server errors)', {
		setup: function () {
			this.deferred = $.Deferred();
			this.spy = this.sandbox.stub( NearbyGateway.prototype, 'getPages' )
				.returns( this.deferred.reject() );
		}
	} );

	QUnit.test( '#render with a server error', function ( assert ) {
		var $el = $( '<div>' ),
			spy = this.spy,
			done = $.Deferred(),
			n = new Nearby( {
				api: api,
				latitude: 37.7,
				longitude: -122,
				range: 1000,
				el: $el
			} );
		this.deferred.fail( function () {
			assert.ok( spy.calledWithMatch( {
				latitude: 37.7,
				longitude: -122
			}, 1000 ), 'Check API got called' );
			assert.strictEqual( $el.find( '.errorbox' ).length, 1, 'Check error got rendered' );
			assert.strictEqual( $el.find( '.errorbox h2' ).text(),
				n.errorMessages.http.heading, 'Check it is the correct heading' );
			done.resolve();
		} );
		return done;
	} );

	QUnit.module( 'MobileFrontend modules/nearby/Nearby (4 - Around page)', {
		setup: function () {
			this.spy = this.sandbox.stub( NearbyGateway.prototype, 'getPagesAroundPage' )
				.returns( $.Deferred().reject() );
		}
	} );

	QUnit.test( '#getting a title will trigger a different API method', function ( assert ) {
		var $el = $( '<div>' ),
			pageTitle = 'Hello Friends!';
		// eslint-disable-next-line no-new
		new Nearby( {
			api: api,
			pageTitle: pageTitle,
			range: 1000,
			el: $el
		} );
		assert.ok( this.spy.calledWithMatch( pageTitle, 1000 ), 'Check API got called' );
	} );

}( mw.mobileFrontend, jQuery ) );
