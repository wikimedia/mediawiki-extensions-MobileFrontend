var autosign = require( '../../../src/mobile.talk.overlays/autosign' );

QUnit.module( 'MobileFrontend autosign.js' );

QUnit.test( '#autosign', function ( assert ) {
	[
		// Forgot to sign
		[ 'foo', 'foo ~~~~' ],
		// 3 tildes signing (no date)
		[ 'foo ~~~', 'foo ~~~' ],
		// 5 tildes (no name)
		[ 'foo ~~~~~', 'foo ~~~~~' ],
		// No double signing
		[ 'foo ~~~~', 'foo ~~~~' ],
		// Unconventional signing1
		[ 'foo ~~~~ yolo', 'foo ~~~~ yolo' ],
		// Unconventional signing 2
		[ '~~~~ yolo', '~~~~ yolo' ]
	].forEach( function ( testCase ) {
		assert.strictEqual( autosign( testCase[0] ), testCase[1], 'Autosigning works as expected' );
	} );
} );
