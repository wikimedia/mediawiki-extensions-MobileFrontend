(function ($, MFE, MFET) {
module("MobileFrontend application.js: utils", {
	setup: function() {
		MFET.createFixtures();
		var section = '<div class="t_section_heading"></div>';
		$('<div id="mfetest">' + section + '<div id="t_section_1">' + section + '</div>').
			appendTo('#qunit-fixture');
	}
});

test("Basic selector support (#id)", function() {
	strictEqual(MFE.utils("#t_section_1").length, 1, "only one element matches this selector");
});

test("Basic selector support (.className)", function() {
	strictEqual(MFE.utils(".t_section_heading").length, 2, "only two elements matches this selector");
});

test("Basic selector support (tag name)", function() {
	strictEqual(MFE.utils("body").length, 1, "only one element matches this selector");
});

test("addClass", function() {
	var el = $("<div />")[0];
	MFE.utils(el).addClass("foo");
	MFE.utils(el).addClass("bar");
	strictEqual($(el).hasClass("foo"), true);
	strictEqual($(el).hasClass("bar"), true);
});

test("hasClass", function() {
	var el = $("#mfe-test-classes")[0];
	strictEqual(MFE.utils(el).hasClass("test"), true, "testing classes #1");
	strictEqual(MFE.utils(el).hasClass("hello-world"), true, "testing classes #2");
	strictEqual(MFE.utils(el).hasClass("goodbye"), true, "testing classes #3");
	strictEqual(MFE.utils(el).hasClass("camelCase"), true, "testing classes #4");
	strictEqual(MFE.utils(el).hasClass("camelcase"), false, "testing classes #5 (case sensitive)");
	strictEqual(MFE.utils(el).hasClass("hello"), false, "testing classes #6 (impartial matches)");
});

test("removeClass", function() {
	var el = $("<div />")[0];
	MFE.utils(el).addClass("foo");
	MFE.utils(el).addClass("bar");
	MFE.utils(el).removeClass("foo");
	MFE.utils(el).removeClass("bar");
	strictEqual($(el).hasClass("foo"), false);
	strictEqual($(el).hasClass("bar"), false);
});

module("MobileFrontend application.js: logo click", {
	setup: function() {
		MFET.createFixtures();
		MFE.init();
	}
});

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

}(jQuery, mw.mobileFrontend, MobileFrontendTests));
