( function ( M, $ ) {

var $container,
	toggle = M.require( 'toggle' );

function makeSections() {
	$container = $( '<div>' ).appendTo( '#content' );
	$( '<h2 class="section_heading" id="section_1"><span id="First_Section">First Section</span></h2>' ).appendTo( $container );
	$( '<div class="content_block" id="content_1"><p>Text</p></div>' ).appendTo( $container );

	$( '<h2 class="section_heading" id="section_2">' ).appendTo( $container );
	$( '<div class="content_block" id="content_2">' ).appendTo( $container );
	return $container;
}
QUnit.module( 'MobileFrontend toggle.js: wm_toggle_section', {
	setup: function() {
		$container = makeSections();
		sinon.stub( M, 'isWideScreen' ).returns( false );
		toggle.enable();
		$("#section_1,#content_1,#anchor_1").addClass("openSection");
	},
	teardown: function() {
		window.location.hash = "#";
		$container.remove();
		M.isWideScreen.restore();
	}
});

QUnit.test( 'wm_toggle_section', 5, function() {
	strictEqual($("#section_1").hasClass("openSection"), true, "openSection class present");
	toggle.toggle( $( '#section_1' ) );
	strictEqual($("#content_1").hasClass("openSection"), false, "check content is closed on a toggle");
	strictEqual($("#section_1").hasClass("openSection"), false, "check section is closed");

	// perform second toggle
	toggle.toggle( $( '#section_1' ) );
	strictEqual($("#content_1").hasClass("openSection"), true, "check content reopened");
	strictEqual($("#section_1").hasClass("openSection"), true, "check section has reopened");
});

QUnit.test( 'clicking a hash link to reveal an already open section', 2, function() {
	strictEqual($("#section_1").hasClass("openSection"), true, "check section is open");
	toggle.reveal( 'First_Section' );
	strictEqual($("#section_1").hasClass("openSection"), true, "check section is still open");
});

QUnit.test( 'reveal', 2, function() {
	toggle.reveal( '#First_Section_2' );
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
	$( '#section_2' ).trigger( M.tapEvent( 'mouseup' ) );
	strictEqual(visibilityStart, false, "check content is hidden at start");
	strictEqual($("#content_2").hasClass("openSection"), true, "check content is shown on a toggle");
});

QUnit.module( 'MobileFrontend toggle.js: tablet mode', {
	setup: function() {
		$container = makeSections();
		sinon.stub( M, 'isWideScreen' ).returns( true );
		toggle.enable();
	},
	teardown: function() {
		window.location.hash = "#";
		$container.remove();
		M.isWideScreen.restore();
	}
} );

QUnit.test( 'open by default', 1, function() {
	strictEqual( $( '#content_1' ).hasClass( 'openSection' ), true, 'check section is visible at start' );
} );

}( mw.mobileFrontend, jQuery ) );
