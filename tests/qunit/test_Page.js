( function( M, $ ) {
	var Page = M.require( 'Page' );

	QUnit.module( 'MobileFrontend Page' );

	QUnit.test( '#isMainPage', 2, function( assert ) {
		var p = new Page( { title: 'Main Page', isMainPage: true } ),
			p2 = new Page( { title: 'Foo' } );
		assert.strictEqual( p.isMainPage(), true, 'check main page flag is updated' );
		assert.strictEqual( p2.isMainPage(), false, 'check not marked as main page' );
	} );

	QUnit.test( '#getNamespaceId', 8, function( assert ) {
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
		$.each( testCases, function( i, tc ) {
			var p = new Page( { title: tc[0] } );
			assert.strictEqual( p.getNamespaceId(), tc[1], 'Check namespace is as expected' );
		} );
	} );

	QUnit.asyncTest( '#isEditable', function( assert ) {
		QUnit.expect( 4 );
		var p, p2, user, user2;
		user = {
			getGroups: function() {
				return $.Deferred().resolve( ['*'] );
			}
		};
		user2 = {
			getGroups: function() {
				return $.Deferred().resolve( [ '*', 'user', 'autoconfirmed', 'sysop' ] );
			}
		};
		p = new Page( { title: 'Permission check', protection: { edit: ['sysop'] } } );
		p2 = new Page( { title: 'Permission check' } );

		p.isEditable( user ).done( function( status ) {
			assert.strictEqual( status, false, 'anons cannot edit sysop protected pages' );
		} );
		p.isEditable( user2 ).done( function( status ) {
			assert.strictEqual( status, true, 'sysops can edit sysop protected pages' );
		} );
		p2.isEditable( user ).done( function( status ) {
			assert.strictEqual( status, true, 'when no protection level defined assumes anyone can edit' );
		} );
		p2.isEditable( user2 ).done( function( status ) {
			assert.strictEqual( status, true, 'when no protection level defined assumes anyone can edit' );
			QUnit.start();
		} );
	} );

	QUnit.test( '#isTalkPage', 8, function( assert ) {
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
		$.each( testCases, function( i, tc ) {
			var p = new Page( { title: tc[0] } );
			assert.strictEqual( p.isTalkPage(), tc[1], 'Check test is as expected' );
		} );
	} );

}( mw.mobileFrontend, jQuery ) );
