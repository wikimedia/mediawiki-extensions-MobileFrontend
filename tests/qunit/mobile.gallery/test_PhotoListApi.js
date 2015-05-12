( function ( M, $ ) {

	var m = M.require( 'modules/gallery/PhotoListApi' );

	QUnit.module( 'MobileFrontend PhotoListApi' );

	QUnit.test( '#getDescription', function ( assert ) {
		var tests = [
			[ 'File:Pirates in SF 2013-04-03 15-44.png', 'Pirates in SF' ],
			[ 'File:Unpadded 9 pirates in SF 2013-04-03 15-9.png', 'Unpadded 9 pirates in SF' ],
			[ 'File:Jon lies next to volcano 2013-03-18 13-37.jpeg', 'Jon lies next to volcano' ],
			[ 'hello world 37.jpg', 'hello world 37' ],
			[ 'hello world again.jpeg', 'hello world again' ],
			[ 'Fichier:French Photo Timestamp 2013-04-03 15-44.jpg', 'French Photo Timestamp' ],
			[ 'Fichier:Full stop. Photo.unknownfileextension', 'Full stop. Photo' ],
			[ 'File:No file extension but has a . in the title', 'No file extension but has a . in the title' ],
			[ 'Fichier:French Photo.jpg', 'French Photo' ]
		];
		QUnit.expect( tests.length );
		$( tests ).each( function ( i ) {
			var val = m.prototype._getDescription( this[ 0 ] );
			assert.strictEqual( val, this[ 1 ], 'test ' + i );
		} );
	} );

}( mw.mobileFrontend, jQuery ) );
