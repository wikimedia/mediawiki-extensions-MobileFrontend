( function ( $, MFE ) {

module("MobileFrontend application.js: history", {
	setup: function() {
		window.location.hash = "#hash1";
		window.location.hash = "#hash2";
		$( '<div id="hash3">' ).appendTo( document.body );
	},
	teardown: function() {
		$( '#hash3' ).remove();
	}
});

test("history.replaceHash", function() {
	MFE.history.replaceHash("#hash3");
	strictEqual(window.location.hash, "#hash3", "the hash was set for the first time");
});


module( 'MobileFrontend modules' );

test( 'define()', function() {
	MFE.define( 'testModule1', 'test module 1' );
	throws(
		function() {
			MFE.define( 'testModule1', 'again' );
		},
		/already exists/,
		"throws an error when module already exists"
	);
} );

test( 'require()', function() {
	throws(
		function() {
			MFE.require( 'dummy' );
		},
		/not found/,
		"throws an error when module doesn't exist"
	);
	MFE.define( 'testModule2', 'test module 2' );
	strictEqual( MFE.require( 'testModule2' ), 'test module 2' );
} );

}( jQuery, mw.mobileFrontend ) );
