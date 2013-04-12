( function ( M, $ ) {

var m = M.require( 'nearby' );

QUnit.module( 'MobileFrontend Nearby', {
	setup: function() {
		sinon.spy( mw, 'msg' );
	},
	teardown: function() {
		mw.msg.restore();
	}
} );

QUnit.test( 'distanceMessage', function() {
	var msgKm = 'mobile-frontend-nearby-distance', msgM = 'mobile-frontend-nearby-distance-meters',
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

	QUnit.expect( tests.length );
	$( tests ).each( function( i ) {
		m.distanceMessage( this[0] );
		strictEqual( mw.msg.getCall( i ).calledWith( this[1], this[2] ), true, 'failed test ' + i );
	} );
} );

}( mw.mobileFrontend, jQuery ) );
