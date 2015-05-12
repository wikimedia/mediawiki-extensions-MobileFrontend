( function ( m ) {
	QUnit.module( 'MobileFrontend: mf-last-modified' );

	QUnit.test( 'timeAgo()', 8, function ( assert ) {
		assert.deepEqual( m.timeAgo( 40 ), {
			value: 40,
			unit: 'seconds'
		} );
		assert.deepEqual( m.timeAgo( 149 ), {
			value: 2,
			unit: 'minutes'
		} );
		assert.deepEqual( m.timeAgo( 150 ), {
			value: 3,
			unit: 'minutes'
		} );
		assert.deepEqual( m.timeAgo( 7500 ), {
			value: 2,
			unit: 'hours'
		} );
		assert.deepEqual( m.timeAgo( 90000 ), {
			value: 1,
			unit: 'days'
		} );
		assert.deepEqual( m.timeAgo( 9000000 ), {
			value: 3,
			unit: 'months'
		} );
		assert.deepEqual( m.timeAgo( 32000000 ), {
			value: 1,
			unit: 'years'
		} );
		assert.deepEqual( m.timeAgo( 102000000 ), {
			value: 3,
			unit: 'years'
		} );
	} );
} )( mw.mobileFrontend.require( 'modules/lastEdited/time' ) );
