( function ( $, MFE ) {

QUnit.module("MobileFrontend application.js: history", {
	setup: function() {
		window.location.hash = "#hash1";
		window.location.hash = "#hash2";
		$( '<div id="hash3">' ).appendTo( document.body );
	},
	teardown: function() {
		$( '#hash3' ).remove();
	}
});

QUnit.test( 'history.replaceHash', 1, function() {
	MFE.history.replaceHash("#hash3");
	strictEqual(window.location.hash, "#hash3", "the hash was set for the first time");
});


QUnit.module( 'MobileFrontend modules' );

QUnit.test( 'define()', 1, function() {
	MFE.define( 'testModule1', 'test module 1' );
	QUnit.throws(
		function() {
			MFE.define( 'testModule1', 'again' );
		},
		/already exists/,
		"throws an error when module already exists"
	);
} );

QUnit.test( 'require()', 2, function() {
	QUnit.throws(
		function() {
			MFE.require( 'dummy' );
		},
		/not found/,
		"throws an error when module doesn't exist"
	);
	MFE.define( 'testModule2', 'test module 2' );
	strictEqual( MFE.require( 'testModule2' ), 'test module 2' );
} );


QUnit.module( 'MobileFrontend common functions' );

QUnit.test( '#getSessionId', 3, function() {
	var sessionId = MFE.getSessionId();
	strictEqual( typeof sessionId, 'string', 'session ID is a string' );
	strictEqual( sessionId.length, 32, 'session ID is 32 chars long' );
	strictEqual( MFE.getSessionId(), sessionId, 'session ID is not regenerated if present' );
} );

}( jQuery, mw.mobileFrontend ) );
