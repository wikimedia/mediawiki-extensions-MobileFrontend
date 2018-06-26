( function ( M ) {

	var TalkOverlayBase = M.require( 'mobile.talk.overlays/TalkOverlayBase' );

	QUnit.module( 'MobileFrontend TalkOverlayBase' );

	QUnit.test( '#TalkOverlay (autosign)', function ( assert ) {
		var overlay = new TalkOverlayBase( {} );
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
			assert.strictEqual( overlay.autosign( testCase[0] ), testCase[1], 'Autosigning works as expected' );
		} );
	} );

}( mw.mobileFrontend ) );
