( function ( $, M, m ) {

var articles = [
	[ $( '<div><div id="content_0"></div></div>' ), true ], // blank content_0 section
	[ $( '<div><table class="infobox"></div>' ), false ], // infobox
	[ $( '<div><table class="navbox"></div>' ), false ], // nav box
	[ $( '<div><div id="content_0"><div class="thumb"><img></div></div></div>' ), false ] // lead section with thumbnail
];
module( 'MobileFrontend mf-photo.js', {} );

test( 'articleNeedsPhoto', function() {
	var i;
	for ( i = 0; i < articles.length; i++ ) {
		strictEqual( m.articleNeedsPhoto( articles[ i ][ 0 ] ), articles[ i ][ 1 ], 'article ' + i );
	}
} );

}( jQuery, mw.mobileFrontend, mw.mobileFrontend.getModule( 'photos' ) ) );
