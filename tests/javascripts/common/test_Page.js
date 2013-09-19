( function( M ) {
	var Page = M.require( 'Page' );

	QUnit.module( 'MobileFrontend Page' );

	QUnit.test( '#isMainPage', 2, function( assert ) {
		var p = new Page( { title: 'Main Page', isMainPage: true } ),
			p2 = new Page( { title: 'Foo' } );
		assert.strictEqual( p.isMainPage(), true, 'check main page flag is updated' );
		assert.strictEqual( p2.isMainPage(), false, 'check not marked as main page' );
	} );

}( mw.mobileFrontend ) );
