( function ( $, M, s ) {
QUnit.module( 'MobileFrontend: mf-search-2.js - test highlight' );

QUnit.test( 'no results', 1, function() {
	var overlay = new s.SearchOverlay();
	overlay.writeResults( [] );
	strictEqual( overlay.$( '.error' ).length, 1, 'Only no results list item present' );
} ) ;

QUnit.test( 'results', 5, function() {
	var overlay = new s.SearchOverlay();
	overlay.writeResults( [
		{ heading: 'Hello World', url: '/hello world' },
		{ heading: 'Goodbye', url: '/goodbye' }
	] );
	strictEqual( overlay.$( '.error' ).length, 0, 'No no results list item present' );
	strictEqual( overlay.$( 'li' ).length, 2, '2 results items' );
	strictEqual( overlay.$( 'li a[href="/hello world"]' ).length, 1, '1 link with correct url' );
	strictEqual( overlay.$( 'li a[href="/goodbye"]' ).length, 1, '1 link with correct url' );
	strictEqual( overlay.$( 'li a[href="/goodbye"] h2' ).text(), 'Goodbye', 'check label of link' );
} ) ;

QUnit.test( 'highlightSearchTerm', 14, function() {
	var data = [
		[ 'Hello World', 'Hel', '<strong>Hel</strong>lo World' ],
		[ 'Hello kitty', 'el', 'Hello kitty' ], // not at start
		[ 'Hello worl', 'hel', '<strong>Hel</strong>lo worl' ],
		[ 'Belle & Sebastian', 'Belle & S', '<strong>Belle &amp; S</strong>ebastian' ],
		[ 'Belle & the Beast', 'Belle &amp;', 'Belle &amp; the Beast' ],
		[ 'with ? in it', 'with ?', '<strong>with ?</strong> in it' ], // not at start
		[ 'Title with ? in it', 'with ?', 'Title with ? in it' ], // not at start
		[ 'AT&T', 'a', '<strong>A</strong>T&amp;T'],
		[ 'AT&T', 'at&', '<strong>AT&amp;</strong>T'],
		[ '<tag', '&lt;tag', '&lt;tag' ],
		[ '& this is a weird title', '&', '<strong>&amp;</strong> this is a weird title' ],
		[ '& this is a weird title', '&a', '&amp; this is a weird title' ],
		[ '&lt;t', '<t', '&amp;lt;t' ],
		[ "<script>alert('FAIL')</script> should be safe",
			"<script>alert('FAIL'", "<strong>&lt;script&gt;alert('FAIL'</strong>)&lt;/script&gt; should be safe" ]
	];

	$.each( data, function( i, item ) {
		strictEqual( s.highlightSearchTerm( item[0], item[1] ), item[2], 'highlightSearchTerm test ' + i );
	} );
} );

}( jQuery, mw.mobileFrontend, mw.mobileFrontend.require( 'search' ) ) );
