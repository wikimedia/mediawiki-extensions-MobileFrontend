(function ($, MFE, MFET) {
module("MobileFrontend mf-navigation-legacy.js: logo click", {
	setup: function() {
		MFET.createFixtures();
		MFE.navigationLegacy.init();
	}
});

test("logoClick", function() {
	var visible1 = $("#nav").is(":visible");

	var logo = $("#mw-mf-logo")[0];
	MFET.triggerEvent(logo, "click");
	var visible2 = $("#nav").is(":visible");
	MFET.triggerEvent(logo, "click");
	var visible3 = $("#nav").is(":visible");

	strictEqual(visible1, false, "starts invisible");
	strictEqual(visible2, true, "toggle");
	strictEqual(visible3, false, "toggle");
});
}(jQuery, mw.mobileFrontend, MobileFrontendTests));
