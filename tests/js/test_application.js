( function ( $, MFE ) {

module("MobileFrontend application.js: history", {
	setup: function() {
		window.location.hash = "#hash1";
		window.location.hash = "#hash2";
	}
});

test("history.replaceHash", function() {
	MFE.history.replaceHash("#hash3");
	strictEqual(window.location.hash, "#hash3", "the hash was set for the first time");
});

}( jQuery, mw.mobileFrontend ) );
