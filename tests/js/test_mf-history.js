( function( M ) {

module( 'MobileFrontend: mf-history.js', {} );

test( 'updateQueryStringParameter 1', function() {
	var val1 = M.history.updateQueryStringParameter( '/w/Foo?x=4', 'x', '10' );
	strictEqual( val1, '/w/Foo?x=10' );
} );

test( 'updateQueryStringParameter 2', function() {
	var val1 = M.history.updateQueryStringParameter( '/w/Foo', 'x', '10' );
	strictEqual( val1, '/w/Foo?x=10' );
} );

test( 'updateQueryStringParameter 3', function() {
	var val1 = M.history.updateQueryStringParameter( '/w/Foo?y=4&x=4&z=10', 'x', '10' );
	strictEqual( val1, '/w/Foo?y=4&x=10&z=10' );
} );

test( 'updateQueryStringParameter 3', function() {
	var val1 = M.history.updateQueryStringParameter( '/w/Foo?y=4', 'x', '10' );
	strictEqual( val1, '/w/Foo?y=4&x=10' );
} );

} )( mw.mobileFrontend );
