( function ( MFEB ) {
// FIXME: Deprecate writeCookie and readCookie removing need for these tests
QUnit.module( 'MobileFrontend settings.js: cookies' );

QUnit.test( 'read and write cookies', 1, function() {
	var cookie_name = 'test_cookies_module', cookieVal;
	MFEB.writeCookie( cookie_name, 'yes', 40000 );
	cookieVal = MFEB.readCookie( cookie_name );
	strictEqual(cookieVal, "yes",
		"Are you running off localhost?");
});

QUnit.test( 'remove cookie via write', 1, function() {
	var cookie_name = 'test_cookies_module', cookieVal;
	MFEB.writeCookie( cookie_name, "", -1 );
	cookieVal = MFEB.readCookie( cookie_name );
	strictEqual(cookieVal, null, "Cookie deleted");
});

}( mw.mobileFrontend.settings ) );
