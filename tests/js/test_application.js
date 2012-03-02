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

module("MobileFrontend application.js: wm_toggle_section", {
	setup: function() {
		MFET.createFixtures();
		MFE.init();
		$("#content_1,#anchor_1,#section_1 .hide").hide();
		$("#section_1 .show").show();
	},
	teardown: function() {
		MFET.cleanFixtures();
		window.location.hash = "#";
	}
});

test("wm_toggle_section", function() {
	MFE.wm_toggle_section("1");
	strictEqual($("#content_1").is(":visible"), true, "check content is visible on a toggle");
	strictEqual($("#anchor_1").is(":visible"), true, "check anchor is visible on toggle");
	strictEqual($("#section_1 .hide").is(":visible"), true, "check hide button now visible");
	strictEqual($("#section_1 .show").is(":visible"), false, "check show button now hidden");
	
	// perform second toggle
	MFE.wm_toggle_section("1");
	strictEqual($("#content_1").is(":visible"), false, "check content is hidden on a toggle");
	strictEqual($("#anchor_1").is(":visible"), false, "check anchor is hidden on toggle");
	strictEqual($("#section_1 .hide").is(":visible"), false, "check hide button now hidden");
	strictEqual($("#section_1 .show").is(":visible"), true, "check show button now visible");
});

test("wm_reveal_for_hash", function() {
	MFE.wm_reveal_for_hash("#First_Section");
	strictEqual($("#content_1").is(":visible"), true, "check content is visible on a toggle");
	strictEqual($("#anchor_1").is(":visible"), true, "check anchor is visible on toggle");
	strictEqual($("#section_1 .hide").is(":visible"), true, "check hide button now visible");
	strictEqual($("#section_1 .show").is(":visible"), false, "check show button now hidden");
});

test("wm_reveal_for_hash", function() {
	MFE.wm_reveal_for_hash("#First_Section_2");
	strictEqual($("#content_1").is(":visible"), true, "check content is visible on a toggle");
	strictEqual($("#anchor_1").is(":visible"), true, "check anchor is visible on toggle");
	strictEqual($("#section_1 .hide").is(":visible"), true, "check hide button now visible");
	strictEqual($("#section_1 .show").is(":visible"), false, "check show button now hidden");
});

test("clicking hash links", function() {
	MFET.triggerEvent($("[href=#First_Section_2]")[0], "click");
	strictEqual($("#content_1").is(":visible"), true, "check content is visible on a toggle");
	strictEqual($("#anchor_1").is(":visible"), true, "check anchor is visible on toggle");
	strictEqual($("#section_1 .hide").is(":visible"), true, "check hide button now visible");
	strictEqual($("#section_1 .show").is(":visible"), false, "check show button now hidden");
});

test("clicking a heading toggles it", function() {
	var visibilityStart = $("#content_1").is(":visible");
	MFET.triggerEvent($("#section_1")[0], "click");
	strictEqual(visibilityStart, false, "check content is hidden at start");
	strictEqual($("#content_1").is(":visible"), true, "check content is hidden on a toggle");
});
