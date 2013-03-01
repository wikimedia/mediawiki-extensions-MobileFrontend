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

test( 'updateQueryStringParameter 4', function() {
	var val1 = M.history.updateQueryStringParameter( '/w/Foo?x=4', 'x', 'y=10' );
	strictEqual( val1, '/w/Foo?x=y%3D10' );
} );
test( 'getArticleUrl with parameters', function() {
	sinon.stub( mw.config, 'get' ).withArgs( 'wgArticlePath' ).returns( '/w/index.php/$1' );
	strictEqual( M.history.getArticleUrl( 'Foo', {} ), '/w/index.php/Foo' );
	strictEqual( M.history.getArticleUrl( 'Foo', { action: 'edit' } ),
		'/w/index.php/Foo?action=edit' );
	mw.config.get.restore();
} );
} )( mw.mobileFrontend );
