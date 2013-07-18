( function( M ) {

	var Carousel = M.require( 'widgets/carousel' );

	QUnit.module( 'MobileFrontend Carousel', {
		setup: function() {
			this.c = new Carousel( {
				pages: [
					{ text: 'test-1', className: 'page-1', id: 1 },
					{ text: 'test-2', className: 'page-2', id: 2 },
					{ text: 'test-3', className: 'page-3', id: 3 }
				]
			} );
		}
	} );

	QUnit.test( '#next', 5, function() {
		strictEqual( this.c.totalPages, 3, 'There are 3 pages in the carousel' );
		strictEqual( this.c.page, 0, 'Initialises to page 0' );
		this.c.next();
		strictEqual( this.c.page, 1, 'Now page 1' );
		this.c.next();
		strictEqual( this.c.page, 2, 'Now page 2' );
		this.c.next();
		strictEqual( this.c.page, 2, 'Still page 2 (no more pages)' );
	} );

	QUnit.test( '#prev', 4, function() {
		strictEqual( this.c.page, 0, 'Initialises to page 0' );
		this.c.previous();
		strictEqual( this.c.page, 0, 'No previous page' );
		this.c.next();
		strictEqual( this.c.page, 1, 'Now page 1' );
		this.c.previous();
		strictEqual( this.c.page, 0, 'Back on page 0' );
	} );

	QUnit.test( '#showCurrentPage', 3, function() {
		strictEqual( this.c.page, 0, 'Initialises to page 0' );
		this.c.next();
		this.c.showCurrentPage();
		strictEqual( this.c.$( '.slide' ).eq( 0 ).hasClass( 'active' ), false, 'First page is hidden' );
		strictEqual( this.c.$( '.slide' ).eq( 1 ).hasClass( 'active' ), true, 'Second page is visible' );
	} );

}( mw.mobileFrontend, jQuery ) );
