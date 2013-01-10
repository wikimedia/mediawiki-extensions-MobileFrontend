( function ( $, M, m ) {

var articles = [
	[ $( '<div><div id="content_0"></div></div>' ), true ], // blank content_0 section
	[ $( '<div><div id="content_1"><table class="infobox"></div>' ), true ], // infobox
	[ $( '<div><div id="content_0"><table class="infobox"></div></div>' ), false ], // infobox
	[ $( '<div><div id="content_1"><table class="navbox"></div></div>' ), true ], // nav box
	[ $( '<div><div id="content_0"><table class="navbox"></div></div>' ), false ], // nav box
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
