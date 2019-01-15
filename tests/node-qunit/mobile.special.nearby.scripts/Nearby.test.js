var
	jQuery = require( '../utils/jQuery' ),
	dom = require( '../utils/dom' ),
	mediaWiki = require( '../utils/mw' ),
	oo = require( '../utils/oo' ),
	sinon = require( 'sinon' ),
	api = {
		get: function () {}
	},
	sandbox,
	NearbyGateway,
	Nearby,
	util;

QUnit.module( 'MobileFrontend Nearby.js', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );

		util = require( '../../../src/mobile.startup/util' );
		NearbyGateway = require( '../../../src/mobile.special.nearby.scripts/NearbyGateway' );
		Nearby = require( '../../../src/mobile.special.nearby.scripts/Nearby' );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'refresh() with no results, renders empty list', function ( assert ) {
	var $el = util.parseHTML( '<div>' ), nearby,
		spy = sandbox.stub( NearbyGateway.prototype, 'getPages' )
			.returns( util.Deferred().resolve( [] ) ),
		opts = {
			api: api,
			latitude: 37.7,
			longitude: -122,
			range: 1000,
			el: $el,
			eventBus: {
				emit: function () {}
			}
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

QUnit.test( 'refresh() with results, renders with a location', function ( assert ) {
	var
		spy,
		resp = {
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
		},
		$el = util.parseHTML( '<div>' ), nearby,
		opts = {
			api: api,
			latitude: 37.7,
			longitude: -122,
			range: 1000,
			el: $el,
			eventBus: {
				emit: function () {}
			}
		};

	// prevent hits to api due to watch status lookup
	sandbox.stub( api, 'get' ).returns( util.Deferred().resolve( resp ) );

	spy = sandbox.stub( NearbyGateway.prototype, 'getPages' )
		.returns( util.Deferred().resolve( [
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

	nearby = new Nearby( opts );
	return nearby.refresh( opts ).then( function () {
		assert.ok( spy.calledWithMatch( {
			latitude: 37.7,
			longitude: -122
		}, 1000 ), 'Check API got called' );
		assert.strictEqual( $el.find( 'li' ).length, 3, '3 pages render.' );
	} );
} );

QUnit.test( 'refresh() with server error, renders error', function ( assert ) {
	var
		$el = util.parseHTML( '<div>' ),
		spy = sandbox.stub( NearbyGateway.prototype, 'getPages' )
			.returns( util.Deferred().reject() ),
		nearby,
		opts = {
			api: api,
			latitude: 37.7,
			longitude: -122,
			range: 1000,
			el: $el,
			eventBus: {
				emit: function () {}
			}
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
	} );
} );

QUnit.test( 'refresh() getting a title triggers different API method', function ( assert ) {
	var
		spy,
		$el = util.parseHTML( '<div>' ),
		pageTitle = 'Hello Friends!',
		nearby,
		opts = {
			api: api,
			pageTitle: pageTitle,
			range: 1000,
			el: $el,
			eventBus: {
				emit: function () {}
			}
		};

	spy = sandbox.stub( NearbyGateway.prototype, 'getPagesAroundPage' )
		.returns( util.Deferred().reject() );
	nearby = new Nearby( opts );
	nearby.refresh( opts );

	assert.ok( spy.calledWithMatch( pageTitle, 1000 ), 'Check API got called' );
} );
