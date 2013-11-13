( function ( M, $ ) {

var $container,
	toggle = M.require( 'toggle' );

function makeSections() {
	return $( '<div>' ).appendTo( '#content' ).html(
			'<h2 id="section_0"><span id="First_Section">First Section</span></h2>' +
			'<div id="content_block_0"><p>Text</p></div>' +

			'<h2 id="section_1"><a href="#foo">Dummy Link</a></h2>' +
			'<div id="content_block_1"></div>'
		);
}

QUnit.module( 'MobileFrontend toggle.js: wm_toggle_section', {
	setup: function() {
		$container = makeSections();
		sinon.stub( M, 'isWideScreen' ).returns( false );
		toggle.enable();
		toggle.toggle( $( '#section_0' ) );
	},
	teardown: function() {
		window.location.hash = "#";
		$container.remove();
		M.isWideScreen.restore();
	}
});

QUnit.test( 'Toggle section', 5, function() {
	var $section = $( '#section_0' ),
		$content = $( '#content_block_0' );

	strictEqual( $section.hasClass( 'openSection' ), true, 'openSection class present' );
	toggle.toggle( $section );
	strictEqual( $content.hasClass( 'openSection' ), false, 'check content gets closed on a toggle' );
	strictEqual( $section.hasClass( 'openSection' ), false, 'check section is closed' );

	// Perform second toggle
	toggle.toggle( $section );
	strictEqual( $content.hasClass( 'openSection' ), true, 'check content reopened' );
	strictEqual( $section.hasClass( 'openSection' ), true, 'check section has reopened' );
} );

QUnit.test( 'Clicking a hash link to reveal an already open section', 2, function() {
	var $section = $( '#section_0' );

	strictEqual( $section.hasClass( 'openSection' ), true, 'check section is open' );
	toggle.reveal( 'First_Section' );
	strictEqual( $section.hasClass( 'openSection' ), true, 'check section is still open' );
} );

QUnit.test( 'Reveal element', 2, function() {
	toggle.reveal( 'First_Section' );
	strictEqual( $( '#content_block_0' ).hasClass( 'openSection' ), true, 'check content is visible' );
	strictEqual( $( '#section_0' ).hasClass( 'openSection' ), true, 'check section is open' );
} );

QUnit.test( 'Clicking hash links', 2, function() {
	$( '[href=#First_Section]' ).trigger( 'click' );
	strictEqual( $( '#content_block_0' ).hasClass( 'openSection' ), true, 'check content is visible' );
	strictEqual( $( '#section_0' ).hasClass( 'openSection' ), true, 'check section is open' );
} );

QUnit.test( 'Mouseup on a heading toggles it', 2, function() {
	var $content = $( '#content_block_1' );

	strictEqual( $content.hasClass( 'openSection' ), false, 'check content is hidden at start' );

	$( '#section_1' ).trigger( M.tapEvent( 'mouseup' ) );

	strictEqual( $content.hasClass( 'openSection' ), true, 'check content is shown on a toggle' );
} );

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

QUnit.test( 'Open by default', 1, function() {
	strictEqual( $( '#content_block_1' ).hasClass( 'openSection' ), true, 'check section is visible at start' );
} );

}( mw.mobileFrontend, jQuery ) );
