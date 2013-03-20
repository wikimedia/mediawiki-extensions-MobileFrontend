( function( M ) {

	var Carousel = M.require( 'widgets/carousel' );

	module( 'MobileFrontend Carousel' );

	test( '#next', function() {
		var c = new Carousel();
		strictEqual( c.totalPages, 3, 'There are 3 pages in the carousel' );
		strictEqual( c.page, 0, 'Initialises to page 0' );
		c.next();
		strictEqual( c.page, 1, 'Now page 1' );
		c.next();
		strictEqual( c.page, 2, 'Now page 2' );
		c.next();
		strictEqual( c.page, 2, 'Still page 2 (no more pages)' );
	} );

	test( '#prev', function() {
		var c = new Carousel();
		strictEqual( c.page, 0, 'Initialises to page 0' );
		c.previous();
		strictEqual( c.page, 0, 'No previous page' );
		c.next();
		strictEqual( c.page, 1, 'Now page 1' );
		c.previous();
		strictEqual( c.page, 0, 'Back on page 0' );
	} );

	test( '#showCurrentPage', function() {
		var c = new Carousel();
		strictEqual( c.page, 0, 'Initialises to page 0' );
		c.next();
		c.showCurrentPage();
		strictEqual( c.$( '.page' ).eq( 0 ).css( 'display' ), 'none', 'First page is hidden' );
		strictEqual( c.$( '.page' ).eq( 1 ).css( 'display' ), 'block', 'Second page is visible' );
	} );

}( mw.mobileFrontend, jQuery ) );
