( function ( M, $ ) {

var m = M.require( 'userGallery' );
module( 'MobileFrontend donate image' );

test( 'extractDescription', function() {
	var tests = [
			[ '== {{int:filedesc}} ==\nHello world', 'Hello world' ],
			[ '==Foo 1==\nbar 1\n==Foo 2==\nbar 2\n== {{int:filedesc}} ==\npicture of cat\n', 'picture of cat' ],
			[ '==Foo 1==\nbar 1\n== {{int:filedesc}} ==\npicture of dog\n==Foo 2==\nbar 2\n', 'picture of dog' ],
			[ '== Yo ==\nother text', '' ]
		];
	$( tests ).each( function( i ) {
		var val = m.extractDescription( this[0] );
		strictEqual( val, this[1], 'test ' + i );
	} );
} );

}( mw.mobileFrontend, jQuery ) );
