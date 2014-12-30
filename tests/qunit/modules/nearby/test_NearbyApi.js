( function ( M, $ ) {

	var NearbyApi = M.require( 'modules/nearby/NearbyApi' ),
		m;

	QUnit.module( 'MobileFrontend NearbyApi', {
		setup: function () {
			m = new NearbyApi();
			this.sandbox.stub( m, 'ajax', function () {
				return $.Deferred().resolve( {
					query: {
						pages: {
							20004112: {
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
									globe: 'earth'
								} ]
							},
							18618509: {
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
									globe: 'earth'
								} ]
							},
							9297443: {
								pageid: 9297443,
								ns: 0,
								title: 'W San Francisco',
								coordinates: [ {
									lat: 37.7854,
									lon: -122.61,
									primary: '',
									globe: 'earth'
								} ]
							}
						}
					}
				} );
			} );
		}
	} );

	QUnit.test( '#_distanceMessage', function ( assert ) {
		var msgKm = 'mobile-frontend-nearby-distance',
			msgM = 'mobile-frontend-nearby-distance-meters',
			tests = [
				[ 0.4834, msgM, '490' ],
				[ 0.5, msgM, '500' ],
				[ 0.723, msgM, '730' ],
				[ 0.999, msgKm, '1' ],
				[ 1.2, msgKm, '1.20' ],
				[ 1.588, msgKm, '1.59' ],
				[ 1.123, msgKm, '1.13' ],
				[ 2.561, msgKm, '2.6' ],
				[ 10.8334, msgKm, '10.9' ]
			];
		this.sandbox.spy( mw, 'msg' );

		QUnit.expect( tests.length );
		$( tests ).each( function ( i ) {
			m._distanceMessage( this[ 0 ] );
			assert.ok( mw.msg.getCall( i ).calledWith( this[ 1 ], mw.language.convertNumber( this[ 2 ] ) ), 'failed test ' + i );
		} );

		mw.msg.restore();
	} );

	QUnit.test( '#getPages', 6, function ( assert ) {
		m.getPages( {
			latitude: 37.786825199999996,
			longitude: -122.4
		} ).done( function ( pages ) {
			assert.strictEqual( pages.length, 3 );
			assert.strictEqual( pages[ 0 ].title, 'The Montgomery (San Francisco)' );
			assert.strictEqual( pages[ 0 ].pageimageClass, 'list-thumb-x' );
			assert.strictEqual( pages[ 2 ].title, 'W San Francisco' );
			assert.strictEqual( pages[ 2 ].pageimageClass, 'list-thumb-none list-thumb-x' );
			assert.strictEqual( pages[ 2 ].dist.toPrecision( 6 ), '23.3769' );
		} );
	} );

	QUnit.test( '#getPagesAroundPage', 4, function ( assert ) {
		m.getPagesAroundPage( 'The Montgomery (San Francisco)' ).done( function ( pages ) {
			assert.strictEqual( pages.length, 2 );
			assert.strictEqual( pages[ 1 ].title, 'W San Francisco' );
			assert.strictEqual( pages[ 1 ].pageimageClass, 'list-thumb-none list-thumb-x' );
			assert.strictEqual( pages[ 1 ].dist.toPrecision( 6 ), '22.2639' );
		} );
	} );

}( mw.mobileFrontend, jQuery ) );
