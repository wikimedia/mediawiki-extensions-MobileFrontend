var MFE = MobileFrontend;
var MFET = window.MobileFrontendTests;

module("MobileFrontend application.js: utils");

test("Basic selector support (#id)", function() {
	strictEqual(MFE.utils("#section_1").length, 1, "only one element matches this selector");
});

test("Basic selector support (.className)", function() {
	strictEqual(MFE.utils(".section_heading").length, 2, "only two elements matches this selector");
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
	},
	teardown: function() {
		MFET.cleanFixtures();
	}
});

test("logoClick", function() {
	var visible1 = $("#nav").is(":visible");

	var logo = $("#logo")[0];
	MFET.triggerEvent(logo, "click");
	var visible2 = $("#nav").is(":visible");
	MFET.triggerEvent(logo, "click");
	var visible3 = $("#nav").is(":visible");

	strictEqual(visible1, false, "starts invisible");
	strictEqual(visible2, true, "toggle");
	strictEqual(visible3, false, "toggle");
});

