(function ($, MFEB, MFET, settings) {
var BANNER_COOKIE_NAME = "zero-rated-banner";
module("MobileFrontend banner.js: notifications", {
	setup: function() {
		localStorage.clear();
		settings.removeCookie(BANNER_COOKIE_NAME);
		$( '<div id="zero-rated-banner" class="mw-mf-banner"><button></div>' ).appendTo( document.body );
	},
	teardown: function() {
		$( '#zero-rated-banner' ).remove();
		settings.removeCookie(BANNER_COOKIE_NAME);
	}
});

test("MobileFrontend banner.js: dismiss notification", function() {
	var cookieStart, cookieEnd;
	MFEB.init();
	cookieStart = settings.getUserSetting( BANNER_COOKIE_NAME );
	strictEqual(cookieStart, null, "no cookie set at start");
	strictEqual($("#zero-rated-banner").is(":visible"), true, "banner should be on show");

	// trigger dismiss event
	$( '#zero-rated-banner button' ).trigger( 'click' );

	cookieEnd = settings.getUserSetting( BANNER_COOKIE_NAME );
	strictEqual(cookieStart, null, "no cookie set at start");
	strictEqual($("#zero-rated-banner").is(":visible"), false, "banner should now be hidden");
	strictEqual(cookieEnd, "off", "banner now set for dismissal");
});
}( jQuery, mw.mobileFrontend.getModule( 'banner' ), MobileFrontendTests, mw.mobileFrontend.getModule( 'settings' ) ) );
