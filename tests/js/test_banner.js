(function ($, MFEB, MFET) {
module("MobileFrontend banner.js: cookies");

test("read and write cookies", function() {
	var cookie_name = "test_cookies_module";
	MFEB.writeCookie(cookie_name, "yes", 400);
	var cookieVal = MFEB.readCookie(cookie_name);
	strictEqual(cookieVal, "yes",
		"Are you running off localhost?");
});

test("read and write cookies with spaces", function() {
	var cookie_name = "test_cookies_module";
	MFEB.writeCookie(cookie_name, "     yes this has spaces    ", 400);
	MFEB.writeCookie(cookie_name + "2", "     yes this has spaces    ", 400);
	var cookieVal = MFEB.readCookie(cookie_name);
	strictEqual(cookieVal, "yes this has spaces",
		"spaces are kept and trailing whitespace is removed");
});

test("remove cookie via write", function() {
	var cookie_name = "test_cookies_module";
	MFEB.writeCookie(cookie_name, "", -1);
	var cookieVal = MFEB.readCookie(cookie_name);
	strictEqual(cookieVal, null, "Cookie deleted");
});

var BANNER_COOKIE_NAME = "zeroRatedBannerVisibility";
module("MobileFrontend application.js: notifications", {
	setup: function() {
		MFEB.removeCookie(BANNER_COOKIE_NAME);
		MFET.createFixtures();
		MFEB.init();
	},
	teardown: function() {
		MFEB.removeCookie(BANNER_COOKIE_NAME);
	}
});

test("MobileFrontend banner.js: dismiss notification", function() {
	var cookieStart = MFEB.readCookie(BANNER_COOKIE_NAME);
	strictEqual(cookieStart, null, "no cookie set at start");
	strictEqual($("#zero-rated-banner").is(":visible"), true, "banner should be on show");

	// trigger dismiss event
	$("#dismiss-notification").trigger("click");

	var cookieEnd = MFEB.readCookie(BANNER_COOKIE_NAME);
	strictEqual(cookieStart, null, "no cookie set at start");
	strictEqual($("#zero-rated-banner").is(":visible"), false, "banner should now be hidden");
	strictEqual(cookieEnd, "off", "banner now set for dismissal");
});
}(jQuery, MobileFrontend.banner, MobileFrontendTests));
