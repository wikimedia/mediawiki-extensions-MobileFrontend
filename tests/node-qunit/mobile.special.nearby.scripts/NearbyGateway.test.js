var
	sandbox,
	NearbyGateway,
	util,
	jQuery = require( '../utils/jQuery' ),
	dom = require( '../utils/dom' ),
	mediaWiki = require( '../utils/mw' ),
	oo = require( '../utils/oo' ),
	sinon = require( 'sinon' );

QUnit.module( 'MobileFrontend NearbyGateway.js', {
	beforeEach: function () {
		var api;

		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );

		// needed for extendSearchParams to not throw exception about feature not
		// supporting wikibase descriptions in headless tests
		sandbox.stub( mw.config, 'get' )
			.withArgs( 'wgArticlePath' ).returns( '/w/' )
			.withArgs( 'wgMFDisplayWikibaseDescriptions' )
			.returns( {
				nearby: true
			} )
			// needed bc Page.js expects this call to return an array
			.withArgs( 'wgMFMobileFormatterHeadings', [ 'h1', 'h2', 'h3', 'h4', 'h5' ] )
			.returns( [ 'h1', 'h2', 'h3', 'h4', 'h5' ] );

		util = require( '../../../src/mobile.startup/util' );
		NearbyGateway = require( '../../../src/mobile.special.nearby.scripts/NearbyGateway' );

		api = {
			ajax: function () {}
		};

		sandbox.stub( mw, 'msg' ).returns( '$1' );

		this.nearbyGateway = new NearbyGateway( { api: api } );

		// stub mw.language behavior so we don't have to bring in the real thing
		sandbox.stub( mw.language, 'convertNumber' ).callsFake( function ( arg ) {
			return arg === '1.20' ? '1.2' : String( arg );
		} );

		sandbox.stub( api, 'ajax' ).callsFake( function () {
			return util.Deferred().resolve( {
				query: {
					pages: [
						{
							pageid: 20004112,
							ns: 0,
							title: 'The Montgomery (San Francisco)',
							thumbnail: {
								source: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/The_Montgomery%2C_San_Francisco.jpg/119px-The_Montgomery%2C_San_Francisco.jpg',
								width: 119,
								height: 180
							},
							pageimage: 'The_Montgomery,_San_Francisco.jpg',
							coordinates: [ {
								lat: 37.787,
								lon: -122.41,
								primary: '',
								globe: 'earth',
								dist: 120200
							} ]
						},
						{
							pageid: 18618509,
							ns: 0,
							title: 'Wikimedia Foundation',
							thumbnail: {
								source: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Wikimedia_Foundation_RGB_logo_with_text.svg/180px-Wikimedia_Foundation_RGB_logo_with_text.svg.png',
								width: 180,
								height: 180
							},
							pageimage: 'Wikimedia_Foundation_RGB_logo_with_text.svg',
							coordinates: [ {
								lat: 37.787,
								lon: -122.51,
								primary: '',
								globe: 'earth',
								dist: 0
							} ]
						},
						{
							pageid: 9297443,
							ns: 0,
							title: 'W San Francisco',
							coordinates: [ {
								lat: 37.7854,
								lon: -122.61,
								primary: '',
								globe: 'earth',
								dist: 177400
							} ]
						}
					]
				}
			} );
		} );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( '_distanceMessage()', function ( assert ) {
	var
		self = this,
		msgKm = 'mobile-frontend-nearby-distance',
		msgM = 'mobile-frontend-nearby-distance-meters',
		tests = [
			[ 0.4834, msgM, '490' ],
			[ 0.5, msgM, '500' ],
			[ 0.723, msgM, '730' ],
			[ 0.999, msgKm, '1' ],
			[ 1.2, msgKm, '1.2' ],
			[ 1.588, msgKm, '1.59' ],
			[ 1.123, msgKm, '1.13' ],
			[ 2.561, msgKm, '2.6' ],
			[ 10.8334, msgKm, '10.9' ]
		];

	tests.forEach( function ( test, i ) {
		self.nearbyGateway._distanceMessage( test[ 0 ] );

		assert.propEqual(
			mw.msg.getCall( i ).args,
			[
				test[ 1 ], test[ 2 ]
			]
		);
	} );
} );

QUnit.test( 'getPages()', function ( assert ) {
	return this.nearbyGateway.getPages( {
		latitude: 37.787,
		longitude: -122.51
	} ).then( function ( pages ) {
		assert.strictEqual( pages.length, 3 );
		assert.strictEqual( pages[ 0 ].title, 'Wikimedia Foundation' );
		assert.strictEqual( pages[ 0 ].thumbnail.isLandscape, false );
		assert.strictEqual( pages[ 2 ].title, 'W San Francisco' );
		assert.strictEqual( pages[ 2 ].thumbnail, false );
		assert.strictEqual( pages[ 2 ].dist.toPrecision( 6 ), '177.400' );
	} );
} );

QUnit.test( 'getPagesAroundPage()', function ( assert ) {
	return this.nearbyGateway.getPagesAroundPage( 'Wikimedia Foundation' ).then( function ( pages ) {
		assert.strictEqual( pages.length, 2 );
		assert.strictEqual( pages[ 1 ].title, 'W San Francisco' );
		assert.strictEqual( pages[ 1 ].thumbnail, false );
		assert.strictEqual( pages[ 1 ].dist.toPrecision( 6 ), '177.400' );
	} );
} );
