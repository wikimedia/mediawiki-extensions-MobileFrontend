( function ( M, $ ) {

var $container,
	toggle = M.require( 'toggle' );

// FIXME: Duplicates code in test_toggle.js
function makeSections() {
	return $( '<div>' ).appendTo( '#content' ).html(
			'<h2 id="section_0"><span id="First_Section">First Section</span></h2>' +
			'<div><p>Text</p></div>' +

			'<h2 id="section_1"><a href="#foo">Dummy Link</a></h2>' +
			'<div></div>'
		);
}

QUnit.module( 'MobileFrontend toggle.js: accessibility', {
	setup: function() {
		$container = makeSections();
		this.sandbox.stub( M, 'isWideScreen' ).returns( false );
		toggle.enable();
	},
	teardown: function() {
		window.location.hash = "#";
		$container.remove();
	}
} );

QUnit.test( 'Pressing space/ enter toggles a heading', 3, function () {
	var $section = $( '#section_1' ),
		$content = $( '#content_block_1' ),
		ev = jQuery.Event( 'keypress' );

	strictEqual( $content.hasClass( 'openSection' ), false, 'check content is hidden at start' );

	// Open the section with pressing space
	ev.which = 32;
	$section.trigger( ev );
	strictEqual( $content.hasClass( 'openSection' ), true, 'check content is shown after pressing space' );

	// Enter should close the section again
	ev.which = 13;
	$section.trigger( ev );
	strictEqual( $content.hasClass( 'openSection' ), false, 'check content is hidden after pressing enter' );
} );

QUnit.test( 'Clicking a link within a heading isn\'t triggering a toggle', 2, function () {
	var $section = $( '#section_1' ),
		$content = $( '#content_block_1' );

	strictEqual( $content.hasClass( 'openSection' ), false, 'check content is hidden at start' );

	$section.find( '> a' ).eq( 0 ).trigger( 'mouseup' );
	strictEqual( $content.hasClass( 'openSection' ), false, 'check content is still being hidden after clicking on the link' );
} );

}( mw.mobileFrontend, jQuery ) );
