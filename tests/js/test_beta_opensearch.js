(function ( $, MFE, MFEOS ) {
QUnit.module( 'MobileFrontend: mf-search.js - test highlight', {
	setup: function() {
		$( '<form id="mw-mf-searchForm"><input id="mw-mf-search"></form>' ).appendTo( document.body );
		$( '<div id="results">' ).appendTo( document.body );
		MFEOS.init();
	},
	teardown: function() {
		$( '#mw-mf-searchForm, #results' ).remove();
	}
});

QUnit.test( 'no results', 1, function() {
	MFEOS.writeResults([]);
	strictEqual($("#results").text(), MFE.message( 'mobile-frontend-search-noresults' ) );
});

QUnit.test( 'writeResults with highlighted text (case differs)', 3, function() {
	var results = [
		{ label: "Hello world", value: "/HelloWorld" },
		{ label: "Hello kitty", value: "/HelloKitty" }
	], pageLink, pageLink2;
	$("#mw-mf-search").val("el");
	$( '#mw-mf-search' ).trigger( 'keyup' );
	MFEOS.writeResults(results);
	pageLink = $( '#results .suggestions-result a.search-result-item' )[ 0 ];
	pageLink2 = $( '#results .suggestions-result a.search-result-item' )[ 1 ];
	strictEqual($(pageLink).text(), "Hello world", "check the label is correct");
	strictEqual($(pageLink).html(), "H<strong>el</strong>lo world", "check the highlight is correct");
	strictEqual($(pageLink2).html(), "H<strong>el</strong>lo kitty", "check the highlight is correct");
});

QUnit.test( 'writeResults with highlighted text (case differs)', 1, function() {
	var results = [
		{ label: "Hello world", value: "/HelloWorld" },
		{ label: "Hello kitty", value: "/HelloKitty" }
	], pageLink;
	$("#mw-mf-search").val("hel");
	$( '#mw-mf-search' ).trigger( 'keyup' );
	MFEOS.writeResults(results);
	pageLink = $( '#results .suggestions-result a.search-result-item' )[ 0 ];
	strictEqual($(pageLink).html(), "<strong>Hel</strong>lo world", "check the highlight is correct");
});

QUnit.test( 'writeResults with highlighted text (special character &amp;)', 1, function() {
	var results = [
		{ label: "Belle & Sebastian", value: "/B1" },
		{ label: "Belle & the Beast", value: "/B2" }
	], pageLink;
	$("#mw-mf-search").val("Belle & S");
	$( '#mw-mf-search' ).trigger( 'keyup' );
	MFEOS.writeResults(results);
	pageLink = $( '#results .suggestions-result a.search-result-item' )[ 0 ];
	strictEqual($(pageLink).html(), "<strong>Belle &amp; S</strong>ebastian", "check the highlight is correct");
});

QUnit.test( 'writeResults with highlighted text (special character ?)', 1, function() {
	var results = [
		{ label: "Title with ? in it", value: "/B1" }
	], pageLink;
	$("#mw-mf-search").val("with ?");
	$( '#mw-mf-search' ).trigger( 'keyup' );
	MFEOS.writeResults(results);
	pageLink = $( '#results .suggestions-result a.search-result-item' )[ 0 ];
	strictEqual($(pageLink).html(), "Title <strong>with ?</strong> in it", "check the highlight is correct");
});

QUnit.test( 'writeResults with highlighted text (safe)', 1, function() {
	var results = [
		{ label: "<script>alert('FAIL')</script> should be safe", value: "/B1" }
	], pageLink;
	$("#mw-mf-search").val("<script>alert('FAIL'");
	$( '#mw-mf-search' ).trigger( 'keyup' );
	MFEOS.writeResults(results);
	pageLink = $( '#results .suggestions-result a.search-result-item' )[ 0 ];
	strictEqual($(pageLink).html(),
		"<strong>&lt;script&gt;alert('FAIL'</strong>)&lt;/script&gt; should be safe", "check the highlight is correct");
});
}( jQuery, mw.mobileFrontend, mw.mobileFrontend.require( 'opensearch' ) ) );
