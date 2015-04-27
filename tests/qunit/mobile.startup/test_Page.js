( function ( M, $ ) {
	var Page = M.require( 'Page' );

	QUnit.module( 'MobileFrontend Page' );

	QUnit.test( '#isMainPage', 2, function ( assert ) {
		var p = new Page( {
				title: 'Main Page',
				isMainPage: true
			} ),
			p2 = new Page( {
				title: 'Foo'
			} );
		assert.strictEqual( p.isMainPage(), true, 'check main page flag is updated' );
		assert.strictEqual( p2.isMainPage(), false, 'check not marked as main page' );
	} );

	QUnit.test( '#getNamespaceId', 8, function ( assert ) {
		var testCases = [
			[ 'Main Page', 0 ],
			[ 'San Francisco', 0 ],
			[ 'San Francisco: Talk:2', 0 ],
			[ 'San Francisco: The Sequel', 0 ],
			[ 'Talk:Foo', 1 ],
			[ 'Project:Bar', 4 ],
			[ 'User talk:Jon', 3 ],
			[ 'Special:Nearby', -1 ]
		];
		$.each( testCases, function ( i, tc ) {
			var p = new Page( {
				title: tc[ 0 ]
			} );
			assert.strictEqual( p.getNamespaceId(), tc[ 1 ], 'Check namespace is as expected' );
		} );
	} );

	QUnit.test( '#isTalkPage', 8, function ( assert ) {
		var testCases = [
			[ 'Main Page', false ],
			[ 'San Francisco', false ],
			[ 'San Francisco: Talk:2', false ],
			[ 'San Francisco: The Sequel', false ],
			[ 'Talk:Foo', true ],
			[ 'Project talk:Bar', true ],
			[ 'User talk:Jon', true ],
			[ 'Special:Nearby', false ]
		];
		$.each( testCases, function ( i, tc ) {
			var p = new Page( {
				title: tc[ 0 ]
			} );
			assert.strictEqual( p.isTalkPage(), tc[ 1 ], 'Check test is as expected' );
		} );
	} );

}( mw.mobileFrontend, jQuery ) );
