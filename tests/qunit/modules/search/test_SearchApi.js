( function ( $, M ) {

	var SearchApi = M.require( 'modules/search/SearchApi' );

	QUnit.module( 'MobileFrontend: SearchApi' );

	QUnit.test( '._highlightSearchTerm', 14, function( assert ) {
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
			assert.strictEqual( SearchApi._highlightSearchTerm( item[0], item[1] ), item[2], 'highlightSearchTerm test ' + i );
		} );
	} );

}( jQuery, mw.mobileFrontend ) );
