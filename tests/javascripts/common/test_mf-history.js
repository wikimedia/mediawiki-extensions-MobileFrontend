( function( M ) {

QUnit.module( 'MobileFrontend: mf-history.js' );

QUnit.test( 'getArticleUrl with parameters', 2, function() {
	sinon.stub( mw.config, 'get' ).withArgs( 'wgArticlePath' ).returns( '/w/index.php/$1' );
	strictEqual( M.history.getArticleUrl( 'Foo', {} ), '/w/index.php/Foo' );
	strictEqual( M.history.getArticleUrl( 'Foo', { action: 'edit' } ),
		'/w/index.php/Foo?action=edit' );
	mw.config.get.restore();
} );
} )( mw.mobileFrontend );
