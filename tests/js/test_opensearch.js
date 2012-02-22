var MFEOS = MobileFrontend.opensearch;
var _ajax;
module("MobileFrontend opensearch.js - writeResults", {
	setup: function() {
		_ajax = MobileFrontend.utils.ajax;
		MobileFrontend.utils.ajax = function() {};
		$('<div id="sq"><input type="search" id="search"></div>').appendTo(document.body);
		$('<div id="results"></div>').appendTo(document.body);
	},
	teardown: function() {
		MobileFrontend.utils.ajax = _ajax;
		$("#results,#search").remove();
	}
});
test("no results", function() {
	MFEOS.writeResults([]);
	strictEqual($("#results").text(), "No results");
});

test("writeResults", function() {
	var results = [
		{ label: "Hello world", value: "/HelloWorld" },
		{ label: "Hello kitty", value: "/HelloKitty" }
	];
	MFEOS.writeResults(results);
	strictEqual($("#results .suggestions-results").length, 1, "1 wrapper for results");
	strictEqual($("#results .suggestions-results .suggestions-result").length, 2, "2 results");
	strictEqual($("#results .suggestions-results .suggestions-result a").length, 4, "2 links in 2 results = 4");
	var autocomplete = $("#results .suggestions-result a.sq-val-update")[0];
	var pageLink = $("#results .suggestions-result a.search-result-item")[0];
	strictEqual($(autocomplete).text(), "+", "check plus link is there");
	strictEqual($(pageLink).text(), "Hello world", "check the label is correct");
	strictEqual($(pageLink).attr("href"), "/HelloWorld", "check the href is correct");
	MFET.triggerEvent(autocomplete, "click");
	strictEqual($("#search").val(), "Hello world ", "check the value has passed across to the search box");
});

module("MobileFrontend opensearch.js", {
	setup: function() {
		$("#results").remove();
		var html = '<div class="suggestions-result"><a class="sq-val-update">+</a><a class="search-result-item">label</a></div>';
		$('<div id="results" />').html(html).appendTo(document.body);
		$(document.body).show();
		MFEOS.init();
	},
	teardown: function() {
		$('#results').remove();
	}
});

test("clear results (mouse down on body element)", function() {
	var results = $("#results");
	var initialVisibility = results.is(":visible");
	MFET.triggerEvent(document.body, "mousedown");
	var nowVisibility = results.is(":visible");
	strictEqual(initialVisibility, true, "visible at start");
	strictEqual(nowVisibility, false, "hidden at end");
});

test("clear results (mousedown on child of #results)", function() {
	var initialVisibility = $("#results").is(":visible");
	MFET.triggerEvent($("#results .sq-val-update")[0], "mousedown");
	strictEqual(initialVisibility, true, "visible at start");
	strictEqual($("#results").is(":visible"), true, "visible at end");
});

test("clear results (mousedown on #results element)", function() {
	var initialVisibility = $("#results").is(":visible");
	MFET.triggerEvent($("#results")[0], "mousedown");
	var nowVisibility = $("#results").is(":visible");
	strictEqual(initialVisibility, true, "visible at start");
	strictEqual(nowVisibility, false, "hidden at end");
});

test("createObjectArray", function() {
	var xmlString = ["<SearchSuggestion>", "<Query>Turing</Query>",
		"<Section>",
		"<Item><Text>Alan Turing</Text><Url>http://en.wikipedia.org/wiki/Turing</Url></Item>",
		"<Item><Text>Turing Machine</Text><Url>http://en.wikipedia.org/wiki/Turing_machine</Url></Item>",
		"</Section></SearchSuggestion>"].join("");
	var xml = $(xmlString)[0]
	var obj = MFEOS.createObjectArray(xml);
	strictEqual(obj.length, 2, "2 results should be found");
	strictEqual(obj[0].label, "Alan Turing", "check label");
	strictEqual(obj[0].value, "http://en.wikipedia.org/wiki/Turing", "check value");
	strictEqual(obj[1].label, "Turing Machine", "check label");
});
