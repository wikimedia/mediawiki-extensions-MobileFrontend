(function ($, MFEOS, MFET, MFE) {
module("beta_opensearch.js - test highlight", {
	setup: function() {
		MFET.createFixtures();
		MFEOS.init();
	}
});

test("no results", function() {
	MFEOS.writeResults([]);
	strictEqual($("#results").text(), MFE.message( 'mobile-frontend-search-noresults' ) );
});

test("writeResults with highlighted text (case differs)", function() {
	var results = [
		{ label: "Hello world", value: "/HelloWorld" },
		{ label: "Hello kitty", value: "/HelloKitty" }
	];
	$("#mw-mf-search").val("el");
	MFET.triggerEvent($("#mw-mf-search")[0], "keyup");
	MFEOS.writeResults(results);
	var pageLink = $("#results .suggestions-result a.search-result-item")[0];
	var pageLink2 = $("#results .suggestions-result a.search-result-item")[1];
	strictEqual($(pageLink).text(), "Hello world", "check the label is correct");
	strictEqual($(pageLink).html(), "H<strong>el</strong>lo world", "check the highlight is correct");
	strictEqual($(pageLink2).html(), "H<strong>el</strong>lo kitty", "check the highlight is correct");
});

test("writeResults with highlighted text (case differs)", function() {
	var results = [
		{ label: "Hello world", value: "/HelloWorld" },
		{ label: "Hello kitty", value: "/HelloKitty" }
	];
	$("#mw-mf-search").val("hel");
	MFET.triggerEvent($("#mw-mf-search")[0], "keyup");
	MFEOS.writeResults(results);
	var pageLink = $("#results .suggestions-result a.search-result-item")[0];
	strictEqual($(pageLink).html(), "<strong>Hel</strong>lo world", "check the highlight is correct");
});

test("writeResults with highlighted text (special character &amp;)", function() {
	var results = [
		{ label: "Belle & Sebastian", value: "/B1" },
		{ label: "Belle & the Beast", value: "/B2" }
	];
	$("#mw-mf-search").val("Belle & S");
	MFET.triggerEvent($("#mw-mf-search")[0], "keyup");
	MFEOS.writeResults(results);
	var pageLink = $("#results .suggestions-result a.search-result-item")[0];
	strictEqual($(pageLink).html(), "<strong>Belle &amp; S</strong>ebastian", "check the highlight is correct");
});

test("writeResults with highlighted text (special character ?)", function() {
	var results = [
		{ label: "Title with ? in it", value: "/B1" }
	];
	$("#mw-mf-search").val("with ?");
	MFET.triggerEvent($("#mw-mf-search")[0], "keyup");
	MFEOS.writeResults(results);
	var pageLink = $("#results .suggestions-result a.search-result-item")[0];
	strictEqual($(pageLink).html(), "Title <strong>with ?</strong> in it", "check the highlight is correct");
});

test("writeResults with highlighted text (safe)", function() {
	var results = [
		{ label: "<script>alert('FAIL')</script> should be safe", value: "/B1" }
	];
	$("#mw-mf-search").val("<script>alert('FAIL'");
	MFET.triggerEvent($("#mw-mf-search")[0], "keyup");
	MFEOS.writeResults(results);
	var pageLink = $("#results .suggestions-result a.search-result-item")[0];
	strictEqual($(pageLink).html(),
		"<strong>&lt;script&gt;alert('FAIL'</strong>)&lt;/script&gt; should be safe", "check the highlight is correct");
});
}( jQuery, mw.mobileFrontend.getModule( 'opensearch' ), window.MobileFrontendTests, mw.mobileFrontend ) );
