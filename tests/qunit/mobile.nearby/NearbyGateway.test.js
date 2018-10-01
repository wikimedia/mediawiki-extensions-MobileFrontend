( function ( M, $ ) {
	var m,
		NearbyGateway = M.require( 'mobile.nearby/NearbyGateway' );

	QUnit.module( 'MobileFrontend NearbyGateway', {
		beforeEach: function () {
			var api = {
				ajax: function () {}
			};
			m = new NearbyGateway( { api: api } );
			this.sandbox.stub( api, 'ajax', function () {
				return $.Deferred().resolve( {
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

		$( tests ).each( function ( i ) {
			m._distanceMessage( this[ 0 ] );
			assert.deepEqual(
				mw.msg.getCall( i ).args,
				[
					this[ 1 ], mw.language.convertNumber( this[ 2 ] )
				]
			);
		} );

		mw.msg.restore();
	} );

	QUnit.test( '#getPages', function ( assert ) {
		return m.getPages( {
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

	QUnit.test( '#getPagesAroundPage', function ( assert ) {
		return m.getPagesAroundPage( 'Wikimedia Foundation' ).then( function ( pages ) {
			assert.strictEqual( pages.length, 2 );
			assert.strictEqual( pages[ 1 ].title, 'W San Francisco' );
			assert.strictEqual( pages[ 1 ].thumbnail, false );
			assert.strictEqual( pages[ 1 ].dist.toPrecision( 6 ), '177.400' );
		} );
	} );

}( mw.mobileFrontend, jQuery ) );
