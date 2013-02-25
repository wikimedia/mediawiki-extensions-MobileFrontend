( function ( $, M ) {

var photo = M.require( 'photo' ),
	articles = [
		// blank #content_0
		[ $( '<div><div id="content_0"></div></div>' ), true ],
		// infobox in #content_1
		[ $( '<div><div id="content_0"></div><div id="content_1"><table class="infobox"></div>' ), true ],
		// infobox in #content_0
		[ $( '<div><div id="content_0"><table class="infobox"></div></div>' ), false ],
		// navbox in #content_1
		[ $( '<div><div id="content_0"></div><div id="content_1"><table class="navbox"></div></div>' ), true ],
		// navbox in #content_0
		[ $( '<div><div id="content_0"><table class="navbox"></div></div>' ), false ],
		// thumbnail in #content_0
		[ $( '<div><div id="content_0"><div class="thumb"><img></div></div></div>' ), false ],
		// no #content_0 and no thumbnail, infobox or navbox
		[ $( '<div><p></p><div>' ), true ],
		// no #content_0 and a thumbnail
		[ $( '<div><div class="thumb"><img></div><div>' ), false ],
		// no #content_0 and an infobox
		[ $( '<div><table class="infobox"><div>' ), false ],
		// no #content_0 and a navbox
		[ $( '<div><table class="navbox"><div>' ), false ]
	];

module( 'MobileFrontend photo', {
	setup: function() {
		this.clock = sinon.useFakeTimers();
	},
	tearDown: function () {
		this.clock.restore();
	}
} );

test( '#needsPhoto', function() {
	var i;
	for ( i = 0; i < articles.length; i++ ) {
		strictEqual( photo._needsPhoto( articles[ i ][ 0 ] ), articles[ i ][ 1 ], 'article ' + i );
	}
} );

test( 'PhotoUploadProgress', function() {
	var progressPopup = new photo._PhotoUploadProgress();
	strictEqual(
		progressPopup.$( '.wait' ).text(),
		'<mobile-frontend-image-uploading-wait>',
		'set initial wait message'
	);
	this.clock.tick( 11000 );
	strictEqual(
		progressPopup.$( '.wait' ).text(),
		'<mobile-frontend-image-uploading-long>',
		'set secondary wait message'
	);
	this.clock.tick( 11000 );
	strictEqual(
		progressPopup.$( '.wait' ).text(),
		'<mobile-frontend-image-uploading-wait>',
		'set initial wait message again'
	);
} );

}( jQuery, mw.mobileFrontend ) );
