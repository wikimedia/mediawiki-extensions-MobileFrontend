(function ($, MFEB, MFET, settings) {
var BANNER_COOKIE_NAME = "zeroRatedBannerVisibility";
module("MobileFrontend banner.js: notifications", {
	setup: function() {
		settings.removeCookie(BANNER_COOKIE_NAME);
		MFET.createFixtures();
		MFEB.init();
	},
	teardown: function() {
		settings.removeCookie(BANNER_COOKIE_NAME);
	}
});

test("MobileFrontend banner.js: dismiss notification", function() {
	var cookieStart = settings.readCookie(BANNER_COOKIE_NAME);
	strictEqual(cookieStart, null, "no cookie set at start");
	strictEqual($("#zero-rated-banner").is(":visible"), true, "banner should be on show");

	// trigger dismiss event
	$("#dismiss-notification").trigger("click");

	var cookieEnd = settings.readCookie(BANNER_COOKIE_NAME);
	strictEqual(cookieStart, null, "no cookie set at start");
	strictEqual($("#zero-rated-banner").is(":visible"), false, "banner should now be hidden");
	strictEqual(cookieEnd, "off", "banner now set for dismissal");
});
}(jQuery, MobileFrontend.banner, MobileFrontendTests, MobileFrontend.settings));
