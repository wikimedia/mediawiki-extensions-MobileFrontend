( function ( $, toggle ) {

var $container;
function makeSections() {
	$container = $( '<div id="content_wrapper">' ).appendTo( document.body );
	$( '<h2 class="section_heading" id="section_1"><span id="First_Section">First Section</span></h2>' ).appendTo( $container );
	$( '<div class="content_block" id="content_1"><p>Text</p></div>' ).appendTo( $container );
	$( '<div id="anchor_1" class="section_anchors" style="display:none"><a href="#section_1" class="back_to_top">&#8593;Jump back a section</a></div>' ).appendTo( $container );

	$( '<h2 class="section_heading" id="section_2">' ).appendTo( $container );
	$( '<div class="content_block" id="content_2">' ).appendTo( $container );
	return $container;
}
QUnit.module( 'MobileFrontend toggle.js: wm_toggle_section', {
	setup: function() {
		$container = makeSections();
		toggle.enable();
		$("#section_1,#content_1,#anchor_1").addClass("openSection");
	},
	teardown: function() {
		window.location.hash = "#";
		$container.remove();
	}
});

QUnit.test( 'wm_toggle_section', 5, function() {
	strictEqual($("#section_1").hasClass("openSection"), true, "openSection class present");
	toggle.wm_toggle_section( '1' );
	strictEqual($("#content_1").hasClass("openSection"), false, "check content is closed on a toggle");
	strictEqual($("#section_1").hasClass("openSection"), false, "check section is closed");

	// perform second toggle
	toggle.wm_toggle_section( '1' );
	strictEqual($("#content_1").hasClass("openSection"), true, "check content reopened");
	strictEqual($("#section_1").hasClass("openSection"), true, "check section has reopened");
});

QUnit.test( 'clicking a hash link to reveal an already open section', 2, function() {
	strictEqual($("#section_1").hasClass("openSection"), true, "check section is open");
	toggle.wm_reveal_for_hash( 'First_Section' );
	strictEqual($("#section_1").hasClass("openSection"), true, "check section is still open");
});

QUnit.test( 'wm_reveal_for_hash', 2, function() {
	toggle.wm_reveal_for_hash( '#First_Section_2' );
	strictEqual($("#content_1").hasClass("openSection"), true, "check content is visible on a toggle");
	strictEqual($("#section_1").hasClass("openSection"), true, "check section is marked as open");
});

QUnit.test( 'clicking hash links', 2, function() {
	$( '[href=#First_Section_2]' ).trigger( 'click' );
	strictEqual($("#content_1").hasClass("openSection"), true, "check content is visible on a toggle");
	strictEqual($("#section_1").hasClass("openSection"), true, "check section marked as open");
});

QUnit.test( 'clicking a heading toggles it', 2, function() {
	var visibilityStart = $("#content_2").hasClass("openSection");
	$( '#section_2' ).trigger( 'tap' );
	strictEqual(visibilityStart, false, "check content is hidden at start");
	strictEqual($("#content_2").hasClass("openSection"), true, "check content is shown on a toggle");
});

QUnit.module( 'MobileFrontend toggle.js (beta): closing sections', {
	setup: function() {
		$("body").addClass('beta');
		$container = makeSections();

		toggle.enable();
		$("#section_1,#content_1,#anchor_1").addClass("openSection");
	},
	teardown: function() {
		$("body").removeClass('beta');
		$container.remove();
	}
});

QUnit.test( 'close a section', 1, function() {
	strictEqual( $( '#anchor_1' ).length, 0, 'check anchor is no longer present' );
});

}( jQuery, mw.mobileFrontend.require( 'toggle' ) ) );
