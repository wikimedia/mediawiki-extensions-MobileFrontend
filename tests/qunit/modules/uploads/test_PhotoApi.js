( function ( $, M ) {

	var photo = M.require( 'modules/uploads/_photo' ),
		PhotoApi = M.require( 'modules/uploads/PhotoApi' ),
		Page = M.require( 'Page' ),
		EditorApi = M.require( 'modules/editor/EditorApi' ),
		editorApi, photoApi;

	QUnit.module( 'MobileFrontend modules/uploads/PhotoApi', {
		setup: function () {
			var resp = {
				warnings: {
					main: {
						'*': 'Unrecognized parameters: "useformat", "r"'
					}
				},
				upload: {
					result: 'Success',
					filename: 'z_2013-05-13_09-45.jpg',
					imageinfo: {
						timestamp: '2013-05-13T16:45:53Z',
						user: 'Jdlrobson',
						userid: 825,
						size: 182912,
						width: 960,
						height: 578,
						parsedcomment: 'Added photo for use on page',
						comment: 'Added photo for use on page',
						url: 'http://upload.beta.wmflabs.org/wikipedia/en/b/b3/Tulip_test_2013-05-13_09-45.jpg',
						descriptionurl: 'http://en.wikipedia.beta.wmflabs.org/wiki/File:Tulip_test_2013-05-13_09-45.jpg',
						sha1: '7e56537b1929d7d4d211bded2d46ba01ddbbe30f',
						metadata: [ {
							name: 'JPEGFileComment',
							value: [ {
								name: 0,
								value: '*'
							} ]
						}, {
							name: 'MEDIAWIKI_EXIF_VERSION',
							value: 2
						} ],
						mime: 'image/jpeg',
						mediatype: 'BITMAP',
						bitdepth: 8
					}
				}
			};

			editorApi = new EditorApi( {} );
			photoApi = new PhotoApi( {
				page: new Page( {
					title: 'Foo',
					namespaceNumber: 0
				} ),
				editorApi: editorApi
			} );
			// Saves to edits will use getToken
			this.sandbox.stub( editorApi, 'getToken' ).returns( $.Deferred().resolve( 'foo' ) );
			this.sandbox.stub( editorApi, 'post' ).returns( $.Deferred().resolve( {
				edit: {
					result: 'Success'
				}
			} ) );
			this.sandbox.stub( photoApi, 'postWithToken' ).returns( $.Deferred().resolve( resp ) );
		}
	} );

	QUnit.test( '#save, upload with missing filename', 1, function ( assert ) {
		var resp = {
				upload: {
					result: 'Warning',
					warnings: {
						badfilename: '::.JPG'
					},
					filekey: '1s.1.jpg',
					sessionkey: 'z1.jpg'
				}
			},
			spy = this.sandbox.spy();

		photoApi.postWithToken.returns( $.Deferred().resolve( resp ) );

		photoApi.save( {
			file: {
				name: '::'
			},
			description: 'yo:: yo ::'
		} ).fail( spy );

		assert.ok( spy.calledWith( {
			stage: 'upload',
			type: 'warning',
			details: 'badfilename/::.JPG'
		} ), 'The request caused a bad file name error' );
	} );

	QUnit.test( '#save, successful upload', 2, function ( assert ) {
		var spy = this.sandbox.spy();
		this.sandbox.spy( editorApi, 'setPrependText' );

		photoApi.save( {
			file: {
				name: 'z.jpg'
			},
			description: 'hello world'
		} ).done( spy );

		assert.ok( spy.calledOnce, 'call done' );
		assert.ok( editorApi.setPrependText.calledWith( '[[File:z_2013-05-13_09-45.jpg|thumbnail|hello world]]\n\n' ), 'prepend text' );
	} );

	QUnit.test( '#save, error uploading, AbuseFilter', 2, function ( assert ) {
		var doneSpy = this.sandbox.spy(),
			failSpy = this.sandbox.spy();

		photoApi.postWithToken.returns( $.Deferred().resolve( {
				error: {
					code: 'verification-error',
					info: 'This file did not pass file verification',
					details: [ 'abusefilter-warning', 'test', 1 ]
				}
			} ) );

		photoApi.save( {
			insertInPage: true,
			file: {
				name: 'z.jpg'
			},
			description: 'hello world'
		} ).done( doneSpy ).fail( failSpy );

		assert.ok( !doneSpy.called, 'don\'t call done' );
		assert.ok( failSpy.calledWith( {
			stage: 'upload',
			type: 'error',
			details: 'verification-error/abusefilter-warning'
		} ), 'call fail' );
	} );

	QUnit.test( '#save. error inserting in page, captcha', 2, function ( assert ) {
		var doneSpy = this.sandbox.spy(),
			failSpy = this.sandbox.spy(),
			captcha = {
				type: 'image',
				mime: 'image/png',
				id: '1852528679',
				url: '/w/index.php?title=Especial:Captcha/image&wpCaptchaId=1852528679'
			};

		editorApi.post
			.returns( $.Deferred().resolve( {
				edit: {
					captcha: captcha,
					result: 'Failure'
				}
			} ) );

		photoApi.save( {
			insertInPage: true,
			file: {
				name: 'z.jpg'
			},
			description: 'hello world'
		} ).done( doneSpy ).fail( failSpy );

		assert.ok( !doneSpy.called, 'don\'t call done' );
		assert.ok( failSpy.calledWith( {
			stage: 'edit',
			type: 'captcha',
			details: captcha
		} ), 'call fail' );
	} );

	QUnit.test( '#save, error inserting in page, AbuseFilter', 2, function ( assert ) {
		var doneSpy = this.sandbox.spy(),
			failSpy = this.sandbox.spy();

		editorApi.post.returns( $.Deferred().resolve( {
			edit: {
				code: 'abusefilter-warning-usuwanie-tekstu',
				info: 'Hit AbuseFilter: Usuwanie du\u017cej ilo\u015bci tekstu',
				warning: 'horrible desktop-formatted message',
				result: 'Failure'
			}
		} ) );

		photoApi.save( {
			insertInPage: true,
			file: {
				name: 'z.jpg'
			},
			description: 'hello world'
		} ).done( doneSpy ).fail( failSpy );

		assert.ok( !doneSpy.called, 'don\'t call done' );
		assert.ok( failSpy.calledWith( {
			stage: 'edit',
			type: 'abusefilter',
			details: {
				type: 'warning',
				message: 'horrible desktop-formatted message'
			}
		} ), 'call fail' );
	} );

	QUnit.module( 'MobileFrontend photo: filenames' );

	QUnit.test( 'generateFileName', 1, function ( assert ) {
		var date = new Date( Date.UTC( 2010, 9, 15, 12, 9 ) ),
			name = photo.generateFileName( 'Jon eating bacon next to an armadillo', '.jpg', date );
		assert.strictEqual( name, 'Jon eating bacon next to an armadillo 2010-10-15 12-09.jpg',
			'Check file name is description with appended date' );
	} );

	QUnit.test( 'generateFileName with double apostrophes', 1, function ( assert ) {
		var date = new Date( Date.UTC( 2010, 9, 15, 12, 9 ) ),
			name = photo.generateFileName( 'Image of \'\' the double apostrophe', '.jpg', date );
		assert.strictEqual( name, 'Image of \'_ the double apostrophe 2010-10-15 12-09.jpg',
			'Check double apostrophe stripped out' );
	} );

	QUnit.test( 'generateFileName test padding', 1, function ( assert ) {
		var date = new Date( Date.UTC( 2013, 2, 1, 12, 51 ) ), // note 0 = january
			name = photo.generateFileName( 'Tomasz eating bacon next to a dinosaur', '.jpg', date );
		assert.strictEqual( name, 'Tomasz eating bacon next to a dinosaur 2013-03-01 12-51.jpg',
			'Check file name is description with appended date and numbers were padded' );
	} );

	QUnit.test( 'generateFileName double spaces', 1, function ( assert ) {
		var longDescription = 'double space  woop woop  ',
			date = new Date( Date.UTC( 2013, 2, 1, 12, 51 ) ),
			name;

		name = photo.generateFileName( longDescription, '.jpg', date );
		assert.strictEqual( name, 'double space woop woop 2013-03-01 12-51.jpg' );
	} );

	QUnit.test( 'generateFileName long line', 2, function ( assert ) {
		var i,
			longDescription = '',
			date = new Date( Date.UTC( 2013, 2, 1, 12, 51 ) ),
			name;

		for ( i = 0; i < 240; i++ ) {
			longDescription += 'a';
		}
		name = photo.generateFileName( longDescription, '.jpg', date );
		assert.strictEqual( name.length, 230, 'Check file name was shortened to the minimum length' );
		assert.strictEqual( name.substr( 223, 7 ), '-51.jpg', 'ends with date' );
	} );

	QUnit.test( 'generateFileName with new lines', 1, function ( assert ) {
		var
			description = 'One\nTwo\nThree',
			date = new Date( Date.UTC( 2013, 2, 1, 12, 51 ) ),
			name;

		name = photo.generateFileName( description, '.jpg', date );
		assert.strictEqual( name, 'One-Two-Three 2013-03-01 12-51.jpg', 'New lines converted' );
	} );

	QUnit.test( 'trimUtf8String', 4, function ( assert ) {
		assert.strictEqual( photo.trimUtf8String( 'Just a string', 20 ), 'Just a string', 'ascii string fits' );
		assert.strictEqual( photo.trimUtf8String( 'Just a string', 10 ), 'Just a str', 'ascii string truncated' );
		assert.strictEqual( photo.trimUtf8String( 'Júst á stríng', 10 ), 'Júst á s', 'latin1 string truncated' );
		assert.strictEqual( photo.trimUtf8String( 'こんにちは', 10 ), 'こんに', 'CJK string truncated' );
	} );

}( jQuery, mw.mobileFrontend ) );
