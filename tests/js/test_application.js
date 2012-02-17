var MFE = MobileFrontend;
var MFET = window.MobileFrontendTests;

module("MobileFrontend application.js: cookies");

test("read and write cookies", function() {
	var cookie_name = "test_cookies_module";
	MFE.writeCookie(cookie_name, "yes", 400);
	var cookieVal = MFE.readCookie(cookie_name);
	strictEqual(cookieVal, "yes",
		"Are you running off localhost?");
});

test("read and write cookies with spaces", function() {
	var cookie_name = "test_cookies_module";
	MFE.writeCookie(cookie_name, "     yes this has spaces    ", 400);
	MFE.writeCookie(cookie_name + "2", "     yes this has spaces    ", 400);
	var cookieVal = MFE.readCookie(cookie_name);
	strictEqual(cookieVal, "yes this has spaces",
		"spaces are kept and trailing whitespace is removed");
});

test("remove cookie via write", function() {
	var cookie_name = "test_cookies_module";
	MFE.writeCookie(cookie_name, "", -1);
	var cookieVal = MFE.readCookie(cookie_name);
	strictEqual(cookieVal, null, "Cookie deleted");
});

var BANNER_COOKIE_NAME = "zeroRatedBannerVisibility";
module("MobileFrontend application.js: notifications", {
	setup: function() {
		MFET.cleanFixtures();
		MFE.removeCookie(BANNER_COOKIE_NAME);
		MFET.createFixtures();
		MFE.init();
	},
	teardown: function() {
		MFET.cleanFixtures();
		MFE.removeCookie(BANNER_COOKIE_NAME);
	}
});

test("dismiss notification", function() {
	var cookieStart = MFE.readCookie(BANNER_COOKIE_NAME);
	strictEqual(cookieStart, null, "no cookie set at start");
	strictEqual($("#zero-rated-banner").is(":visible"), true, "banner should be on show");

	// trigger dismiss event
	$("#dismiss-notification").trigger("click");

	var cookieEnd = MFE.readCookie(BANNER_COOKIE_NAME);
	strictEqual(cookieStart, null, "no cookie set at start");
	strictEqual($("#zero-rated-banner").is(":visible"), false, "banner should now be hidden");
	strictEqual(cookieEnd, "off", "banner now set for dismissal");
});

module("MobileFrontend application.js: clear search", {
	setup: function() {
		MFET.createFixtures();
		MFE.init();
		$("#clearsearch").hide();
	},
	teardown: function() {
		MFET.cleanFixtures();
	}
});

test("setup", function() {
	strictEqual($("#clearsearch").attr("title"), "Clear", "check clearsearch tooltip");
});

test("reveal clearsearch on text", function() {
	$("#search").val("hello");
	var initialVisibility = $("#clearsearch").is(":visible");
	MFET.triggerEvent($("#search")[0], "keyup")
	strictEqual(initialVisibility, false, "at start clear button should be hidden.")
	strictEqual($("#clearsearch").is(":visible"), true, "clear search is now visible");
});

test("hide clearsearch when no text", function() {
	$("#clearsearch").show();
	$("#search").val("");
	var initialVisibility = $("#clearsearch").is(":visible");
	MFET.triggerEvent($("#search")[0], "keyup");
	strictEqual(initialVisibility, true, "at start we made it visible")
	strictEqual($("#clearsearch").is("visible"), false, "now invisible due to lack of text in input");
	strictEqual($("#results").is("visible"), false, "results also hidden");
});

test("click clearSearchBox", function() {
	$("#search").val("hello world");
	$("#results,#clearsearch").show();

	MFET.triggerEvent($("#clearsearch")[0], "mousedown")

	strictEqual($("#search").val(), "", "value reset");
	strictEqual($("#results").is(":visible"), false, "results hidden");
	strictEqual($("#clearsearch").is(":visible"), false, "clear search hidden");
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
