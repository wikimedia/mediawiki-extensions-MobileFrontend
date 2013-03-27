( function ( MFEB ) {
QUnit.module( 'MobileFrontend settings.js: cookies' );

QUnit.test( 'read and write cookies', 1, function() {
	var cookie_name = 'test_cookies_module', cookieVal;
	MFEB.writeCookie(cookie_name, "yes", 400);
	cookieVal = MFEB.readCookie( cookie_name );
	strictEqual(cookieVal, "yes",
		"Are you running off localhost?");
});

QUnit.test( 'read and write cookies with spaces', 1, function() {
	var cookie_name = 'test_cookies_module', cookieVal;
	MFEB.writeCookie(cookie_name, "     yes this has spaces    ", 400);
	MFEB.writeCookie(cookie_name + "2", "     yes this has spaces    ", 400);
	cookieVal = MFEB.readCookie( cookie_name );
	strictEqual(cookieVal, "yes this has spaces",
		"spaces are kept and trailing whitespace is removed");
});

QUnit.test( 'remove cookie via write', 1, function() {
	var cookie_name = 'test_cookies_module', cookieVal;
	MFEB.writeCookie(cookie_name, "", -1);
	cookieVal = MFEB.readCookie( cookie_name );
	strictEqual(cookieVal, null, "Cookie deleted");
});

}( mw.mobileFrontend.settings ) );
