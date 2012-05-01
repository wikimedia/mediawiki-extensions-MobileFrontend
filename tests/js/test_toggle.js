( function ($, MFE, MFET) {
module("MobileFrontend toggle.js: wm_toggle_section", {
	setup: function() {
		MFET.createFixtures();
		MFE.toggle.init();
		$("#section_1,#content_1,#anchor_1").addClass("openSection");
	},
	teardown: function() {
		window.location.hash = "#";
	}
});

test("wm_toggle_section", function() {
	strictEqual($("#section_1").hasClass("openSection"), true, "openSection class present");
	MFE.toggle.wm_toggle_section("1");
	strictEqual($("#content_1").hasClass("openSection"), false, "check content is closed on a toggle");
	strictEqual($("#anchor_1").hasClass("openSection"), false, "check anchor is closed on toggle");
	strictEqual($("#section_1").hasClass("openSection"), false, "check section is closed");
	
	// perform second toggle
	MFE.toggle.wm_toggle_section("1");
	strictEqual($("#content_1").hasClass("openSection"), true, "check content reopened");
	strictEqual($("#anchor_1").hasClass("openSection"), true, "check anchor reopened");
	strictEqual($("#section_1").hasClass("openSection"), true, "check section has reopened");
});

test("clicking a hash link to reveal an already open section", function() {
	strictEqual($("#section_1").hasClass("openSection"), true, "check section is open");
	MFE.toggle.wm_reveal_for_hash("#First_Section");
	strictEqual($("#section_1").hasClass("openSection"), true, "check section is still open");
});

test("wm_reveal_for_hash", function() {
	MFE.toggle.wm_reveal_for_hash("#First_Section_2");
	strictEqual($("#content_1").hasClass("openSection"), true, "check content is visible on a toggle");
	strictEqual($("#anchor_1").hasClass("openSection"), true, "check anchor is visible on toggle");
	strictEqual($("#section_1").hasClass("openSection"), true, "check section is marked as open");
});

test("clicking hash links", function() {
	MFET.triggerEvent($("[href=#First_Section_2]")[0], "click");
	strictEqual($("#content_1").hasClass("openSection"), true, "check content is visible on a toggle");
	strictEqual($("#anchor_1").hasClass("openSection"), true, "check anchor is visible on toggle");
	strictEqual($("#section_1").hasClass("openSection"), true, "check section marked as open");
});

test("clicking a heading toggles it", function() {
	var visibilityStart = $("#content_2").hasClass("openSection");
	MFET.triggerEvent($("#section_2")[0], "click");
	strictEqual(visibilityStart, false, "check content is hidden at start");
	strictEqual($("#content_2").hasClass("openSection"), true, "check content is shown on a toggle");
});
}(jQuery, MobileFrontend, MobileFrontendTests));
