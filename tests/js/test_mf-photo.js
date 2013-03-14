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
		[ $( '<div><table class="navbox"><div>' ), false ],
		// no #content_0, image not in .thumb (happens on main pages)
		[ $( '<div><img><div>' ), false ]
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

test( 'generateFileName', function() {
	var date = new Date( 2010, 9, 15, 12, 51 ),
		name = photo.generateFileName( 'Jon eating bacon next to an armadillo', '.jpg', date );
	strictEqual( name, 'Jon eating bacon next to an armadillo 2010-10-15 12-51.jpg',
		'Check file name is description with appended date' );
} );

test( 'generateFileName test padding', function() {
	var date = new Date( 2013, 2, 1, 12, 51 ), // note 0 = january
		name = photo.generateFileName( 'Tomasz eating bacon next to a dinosaur', '.jpg', date );
	strictEqual( name, 'Tomasz eating bacon next to a dinosaur 2013-03-01 12-51.jpg',
		'Check file name is description with appended date and numbers were padded' );
} );

test( 'generateFileName long line', function() {
	var i,
		longDescription = '',
		date = new Date( 2013, 2, 1, 12, 51 ), name;

	for ( i = 0; i < 240; i++ ) {
		longDescription += 'a';
	}
	name = photo.generateFileName( longDescription, '.jpg', date );
	strictEqual( name.length, 240, 'Check file name was shortened to the minimum length' );
	strictEqual( name.substr( 233, 7 ), '-51.jpg', 'ends with date' );
} );

test( 'generateFileName with new lines', function() {
	var
		description = 'One\nTwo\nThree',
		date = new Date( 2013, 2, 1, 12, 51 ), name;

	name = photo.generateFileName( description, '.jpg', date );
	strictEqual( name, 'One-Two-Three 2013-03-01 12-51.jpg', 'New lines converted' );
} );

test( 'trimUtf8String', function() {
	strictEqual( photo.trimUtf8String( 'Just a string', 20 ), 'Just a string', 'ascii string fits' );
	strictEqual( photo.trimUtf8String( 'Just a string', 10 ), 'Just a str', 'ascii string truncated' );
	strictEqual( photo.trimUtf8String( 'Júst á stríng', 10 ), 'Júst á s', 'latin1 string truncated' );
	strictEqual( photo.trimUtf8String( 'こんにちは', 10 ), 'こんに', 'CJK string truncated' );
} );

}( jQuery, mw.mobileFrontend ) );
