(function ( m ) {
	QUnit.module( 'MobileFrontend: mf-last-modified' );

	QUnit.test( 'timeAgo()', 8, function () {
		deepEqual( m.timeAgo( 40 ), { value: 40, unit: 'seconds' } );
		deepEqual( m.timeAgo( 149 ), { value: 2, unit: 'minutes' } );
		deepEqual( m.timeAgo( 150 ), { value: 3, unit: 'minutes' } );
		deepEqual( m.timeAgo( 7500 ), { value: 2, unit: 'hours' } );
		deepEqual( m.timeAgo( 90000 ), { value: 1, unit: 'days' } );
		deepEqual( m.timeAgo( 9000000 ), { value: 3, unit: 'months' } );
		deepEqual( m.timeAgo( 32000000 ), { value: 1, unit: 'years' } );
		deepEqual( m.timeAgo( 102000000 ), { value: 3, unit: 'years' } );
	} );
})( mw.mobileFrontend.require( 'modules/lastEdited/time' ) );
