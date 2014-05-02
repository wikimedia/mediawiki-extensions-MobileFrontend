( function( M ) {

QUnit.module( 'MobileFrontend: history.js (alpha)' );

QUnit.test( 'updateQueryStringParameter 1', 1, function() {
	var val1 = M.history.updateQueryStringParameter( '/w/Foo?x=4', 'x', '10' );
	strictEqual( val1, '/w/Foo?x=10' );
} );

QUnit.test( 'updateQueryStringParameter 2', 1, function() {
	var val1 = M.history.updateQueryStringParameter( '/w/Foo', 'x', '10' );
	strictEqual( val1, '/w/Foo?x=10' );
} );

QUnit.test( 'updateQueryStringParameter 3', 1, function() {
	var val1 = M.history.updateQueryStringParameter( '/w/Foo?y=4&x=4&z=10', 'x', '10' );
	strictEqual( val1, '/w/Foo?y=4&x=10&z=10' );
} );

QUnit.test( 'updateQueryStringParameter 3', 1, function() {
	var val1 = M.history.updateQueryStringParameter( '/w/Foo?y=4', 'x', '10' );
	strictEqual( val1, '/w/Foo?y=4&x=10' );
} );

QUnit.test( 'updateQueryStringParameter 4', 1, function() {
	var val1 = M.history.updateQueryStringParameter( '/w/Foo?x=4', 'x', 'y=10' );
	strictEqual( val1, '/w/Foo?x=y%3D10' );
} );

QUnit.test( 'updateQueryStringParameter 5', 1, function() {
	var val1 = M.history.updateQueryStringParameter( '/w/Foo?x=4&z&y=2&m', 'm', '1' );
	strictEqual( val1, '/w/Foo?x=4&z=&y=2&m=1' );
} );

} )( mw.mobileFrontend );
