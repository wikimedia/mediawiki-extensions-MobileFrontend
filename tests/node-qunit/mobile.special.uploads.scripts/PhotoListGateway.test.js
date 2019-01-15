var PhotoListGateway, sandbox, getDescription,
	sinon = require( 'sinon' ),
	dom = require( '../utils/dom' ),
	jQuery = require( '../utils/jQuery' );

QUnit.module( 'PhotoListGateway', {
	beforeEach: function () {
		// All this stubbing really shouldn't be needed to test getDescription
		// But it is since require( '../mobile.startup/util' ) is imported by PhotoListGateway
		// Consider putting getDescription in a separate file to separate it from the View.
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		PhotoListGateway = require( '../../../src/mobile.special.uploads.scripts/PhotoListGateway' );
		getDescription = PhotoListGateway.test.getDescription;
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( '#getDescription', function ( assert ) {
	var tests = [
		[ 'File:Pirates in SF 2013-04-03 15-44.png', 'Pirates in SF' ],
		[ 'File:Unpadded 9 pirates in SF 2013-04-03 15-9.png', 'Unpadded 9 pirates in SF' ],
		[ 'File:Jon lies next to volcano 2013-03-18 13-37.jpeg', 'Jon lies next to volcano' ],
		[ 'hello world 37.jpg', 'hello world 37' ],
		[ 'hello world again.jpeg', 'hello world again' ],
		[ 'Fichier:French Photo Timestamp 2013-04-03 15-44.jpg', 'French Photo Timestamp' ],
		[ 'Fichier:Full stop. Photo.unknownfileextension', 'Full stop. Photo' ],
		[ 'File:No file extension but has a . in the title', 'No file extension but has a . in the title' ],
		[ 'Fichier:French Photo.jpg', 'French Photo' ]
	];

	tests.forEach( function ( test, i ) {
		var val = getDescription( test[ 0 ] );
		assert.strictEqual( val, test[ 1 ], 'test ' + i );
	} );
} );
