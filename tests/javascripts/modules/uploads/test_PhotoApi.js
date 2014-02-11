( function ( $, M ) {

	var photo = M.require( 'modules/uploads/_photo' ),
		PhotoApi = M.require( 'modules/uploads/PhotoApi' );

	QUnit.module( 'MobileFrontend photo', {
		setup: function() {
			var resp = {"upload":{"result":"Warning","warnings":{"badfilename":"::.JPG"},"filekey":"1s.1.jpg","sessionkey":"z1.jpg"}},
				resp2 = {"warnings":{"main":{"*":"Unrecognized parameters: 'useformat', 'r'"}},"upload":{"result":"Success","filename":"Tulip_test_2013-05-13_09-45.jpg","imageinfo":{"timestamp":"2013-05-13T16:45:53Z","user":"Jdlrobson","userid":825,"size":182912,"width":960,"height":578,"parsedcomment":"Added photo for use on page","comment":"Added photo for use on page","url":"http://upload.beta.wmflabs.org/wikipedia/en/b/b3/Tulip_test_2013-05-13_09-45.jpg","descriptionurl":"http://en.wikipedia.beta.wmflabs.org/wiki/File:Tulip_test_2013-05-13_09-45.jpg","sha1":"7e56537b1929d7d4d211bded2d46ba01ddbbe30f","metadata":[{"name":"JPEGFileComment","value":[{"name":0,"value":"*"}]},{"name":"MEDIAWIKI_EXIF_VERSION","value":2}],"mime":"image/jpeg","mediatype":"BITMAP","bitdepth":8}}};

			this.api = new PhotoApi();
			this.api2 = new PhotoApi();
			this.sandbox.stub( this.api, 'getToken' ).returns( $.Deferred().resolve( 'foo' ) );
			this.sandbox.stub( this.api, 'post' ).returns( $.Deferred().resolve( resp ) );
			this.sandbox.stub( this.api2, 'getToken' ).returns( $.Deferred().resolve( 'foo' ) );
			this.sandbox.stub( this.api2, 'post' ).returns( $.Deferred().resolve( resp2 ) );
		}
	} );

	QUnit.test( 'upload with missing filename', 1, function() {
		var badResponse;
		this.api.save( {
			insertInPage: true,
			file: {
				name: '::'
			},
			description: 'yo:: yo ::'
		} ).fail( function() {
			badResponse = true;
		} );
		strictEqual( badResponse, true, 'The request caused a bad file name error' );
	} );

	QUnit.test( 'successful upload', 1, function() {
		var goodResponse;

		this.api2.post.
			withArgs( sinon.match( { action: 'edit' } ) ).
			returns( $.Deferred().resolve( { edit: { result: 'Success' } } ) );

		this.api2.save( {
			insertInPage: true,
			file: {
				name: 'z.jpg'
			},
			description: 'hello world'
		} ).done( function() {
			goodResponse = true;
		} );
		strictEqual( goodResponse, true, 'The request succeeded and ran done callback' );
	} );

	QUnit.test( 'warnings (large file)', 1, function() {
		var d = $.Deferred(),
			stub = this.sandbox.stub( d, 'reject' );
		this.api2._handleWarnings( d, { 'large-file': true } );
		strictEqual( stub.calledWith( 'Missing filename: Large file' ), true );
	} );

	QUnit.test( 'warnings (existing file)', 1, function() {
		var d = $.Deferred(),
			stub = this.sandbox.stub( d, 'reject' );
		this.api2._handleWarnings( d, { exists: true } );
		strictEqual( stub.calledWith( 'Missing filename: Filename exists', mw.msg( 'mobile-frontend-photo-upload-error-filename' ) ),
			true );
	} );

	QUnit.test( 'error uploading, AbuseFilter', 2, function( assert ) {
		var doneSpy = this.sandbox.spy(), failSpy = this.sandbox.spy();

		this.api2.post.
			returns( $.Deferred().resolve( {"error":{"code":"verification-error","info":"This file did not pass file verification","details":["abusefilter-warning","test",1]}} ) );

		this.api2.save( {
			insertInPage: true,
			file: {
				name: 'z.jpg'
			},
			description: 'hello world'
		} ).done( doneSpy ).fail( failSpy );

		assert.ok( !doneSpy.called, "don't call done" );
		assert.ok( failSpy.calledWith( 'verification-error abusefilter-warning' ), "call fail" );
	} );

	QUnit.test( 'error inserting in page, captcha', 2, function( assert ) {
		var doneSpy = this.sandbox.spy(), failSpy = this.sandbox.spy();

		this.api2.post.
			withArgs( sinon.match( { action: 'edit' } ) ).
			returns( $.Deferred().resolve( { edit: { captcha: {}, result: 'Failure' } } ) );

		this.api2.save( {
			insertInPage: true,
			file: {
				name: 'z.jpg'
			},
			description: 'hello world'
		} ).done( doneSpy ).fail( failSpy );

		assert.ok( !doneSpy.called, "don't call done" );
		assert.ok( failSpy.calledWith( 'captcha' ), "call fail" );
	} );

	QUnit.test( 'error inserting in page, AbuseFilter', 2, function( assert ) {
		var doneSpy = this.sandbox.spy(), failSpy = this.sandbox.spy();

		this.api2.post.
			withArgs( sinon.match( { action: 'edit' } ) ).
			returns( $.Deferred().resolve( { edit: { code: 'abusefilter-warning', result: 'Failure' } } ) );

		this.api2.save( {
			insertInPage: true,
			file: {
				name: 'z.jpg'
			},
			description: 'hello world'
		} ).done( doneSpy ).fail( failSpy );

		assert.ok( !doneSpy.called, "don't call done" );
		assert.ok( failSpy.calledWith( 'abusefilter' ), "call fail" );
	} );

	QUnit.module( 'MobileFrontend photo: filenames' );

	QUnit.test( 'generateFileName', 1, function() {
		var date = new Date( 2010, 9, 15, 12, 9 ),
			name = photo.generateFileName( 'Jon eating bacon next to an armadillo', '.jpg', date );
		strictEqual( name, 'Jon eating bacon next to an armadillo 2010-10-15 12-09.jpg',
			'Check file name is description with appended date' );
	} );

	QUnit.test( 'generateFileName with double apostrophes', 1, function() {
		var date = new Date( 2010, 9, 15, 12, 9 ),
			name = photo.generateFileName( "Image of '' the double apostrophe", '.jpg', date );
		strictEqual( name, 'Image of \'_ the double apostrophe 2010-10-15 12-09.jpg',
			'Check double apostrophe stripped out' );
	} );

	QUnit.test( 'generateFileName test padding', 1, function() {
		var date = new Date( 2013, 2, 1, 12, 51 ), // note 0 = january
			name = photo.generateFileName( 'Tomasz eating bacon next to a dinosaur', '.jpg', date );
		strictEqual( name, 'Tomasz eating bacon next to a dinosaur 2013-03-01 12-51.jpg',
			'Check file name is description with appended date and numbers were padded' );
	} );

	QUnit.test( 'generateFileName long line', 2, function() {
		var i,
			longDescription = '',
			date = new Date( 2013, 2, 1, 12, 51 ), name;

		for ( i = 0; i < 240; i++ ) {
			longDescription += 'a';
		}
		name = photo.generateFileName( longDescription, '.jpg', date );
		strictEqual( name.length, 230, 'Check file name was shortened to the minimum length' );
		strictEqual( name.substr( 223, 7 ), '-51.jpg', 'ends with date' );
	} );

	QUnit.test( 'generateFileName with new lines', 1, function() {
		var
			description = 'One\nTwo\nThree',
			date = new Date( 2013, 2, 1, 12, 51 ), name;

		name = photo.generateFileName( description, '.jpg', date );
		strictEqual( name, 'One-Two-Three 2013-03-01 12-51.jpg', 'New lines converted' );
	} );

	QUnit.test( 'trimUtf8String', 4, function() {
		strictEqual( photo.trimUtf8String( 'Just a string', 20 ), 'Just a string', 'ascii string fits' );
		strictEqual( photo.trimUtf8String( 'Just a string', 10 ), 'Just a str', 'ascii string truncated' );
		strictEqual( photo.trimUtf8String( 'Júst á stríng', 10 ), 'Júst á s', 'latin1 string truncated' );
		strictEqual( photo.trimUtf8String( 'こんにちは', 10 ), 'こんに', 'CJK string truncated' );
	} );

}( jQuery, mw.mobileFrontend ) );
