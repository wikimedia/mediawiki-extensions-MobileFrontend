( function ( $, M ) {

var photo = M.require( 'photo' ),
	articles = [
		[ $( '<div><div id="content_0"></div></div>' ), true ], // blank content_0 section
		[ $( '<div><div id="content_1"><table class="infobox"></div>' ), true ], // infobox
		[ $( '<div><div id="content_0"><table class="infobox"></div></div>' ), false ], // infobox
		[ $( '<div><div id="content_1"><table class="navbox"></div></div>' ), true ], // nav box
		[ $( '<div><div id="content_0"><table class="navbox"></div></div>' ), false ], // nav box
		[ $( '<div><div id="content_0"><div class="thumb"><img></div></div></div>' ), false ] // lead section with thumbnail
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
