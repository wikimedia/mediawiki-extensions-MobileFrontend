(function ($, MFEB, MFET) {
module("MobileFrontend settings.js: cookies");

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

}( jQuery, mw.mobileFrontend.getModule( 'settings' ), MobileFrontendTests, mw.mobileFrontend ) );
