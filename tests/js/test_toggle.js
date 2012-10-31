( function ( $, MFE, MFET, toggle ) {
module("MobileFrontend toggle.js: wm_toggle_section", {
	setup: function() {
		MFET.createFixtures();
		toggle.init();
		$("#section_1,#content_1,#anchor_1").addClass("openSection");
	},
	teardown: function() {
		window.location.hash = "#";
	}
});

test("wm_toggle_section", function() {
	strictEqual($("#section_1").hasClass("openSection"), true, "openSection class present");
	toggle.wm_toggle_section( '1' );
	strictEqual($("#content_1").hasClass("openSection"), false, "check content is closed on a toggle");
	strictEqual($("#anchor_1").hasClass("openSection"), false, "check anchor is closed on toggle");
	strictEqual($("#section_1").hasClass("openSection"), false, "check section is closed");
	
	// perform second toggle
	toggle.wm_toggle_section( '1' );
	strictEqual($("#content_1").hasClass("openSection"), true, "check content reopened");
	strictEqual($("#anchor_1").hasClass("openSection"), true, "check anchor reopened");
	strictEqual($("#section_1").hasClass("openSection"), true, "check section has reopened");
});

test("clicking a hash link to reveal an already open section", function() {
	strictEqual($("#section_1").hasClass("openSection"), true, "check section is open");
	toggle.wm_reveal_for_hash( 'First_Section' );
	strictEqual($("#section_1").hasClass("openSection"), true, "check section is still open");
});

test("wm_reveal_for_hash", function() {
	toggle.wm_reveal_for_hash( '#First_Section_2' );
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
	MFET.triggerEvent($("#section_2")[0], 'mousedown' );
	strictEqual(visibilityStart, false, "check content is hidden at start");
	strictEqual($("#content_2").hasClass("openSection"), true, "check content is shown on a toggle");
});

module("MobileFrontend toggle.js (beta): closing sections", {
	setup: function() {
		MFET.createFixtures();
		$("body").addClass('beta');
		toggle.init();
		$("#section_1,#content_1,#anchor_1").addClass("openSection");
	},
	teardown: function() {
		$("body").removeClass('beta');
	}
});

test("close a section", function() {
	var startVisibility = $("#content_1").hasClass("openSection"), endVisibility,
		closeLink = $("#anchor_1")[0];

	$(closeLink).trigger("click");
	endVisibility = $("#content_1").hasClass("openSection");
	strictEqual($(closeLink).text(), MFE.message("mobile-frontend-close-section"), "text has been updated");
	strictEqual(startVisibility, true, "it is open at start");
	strictEqual(endVisibility, false, "clicking has hidden section content");
});

}( jQuery, mw.mobileFrontend, MobileFrontendTests, mw.mobileFrontend.getModule( 'toggle' ) ) );
