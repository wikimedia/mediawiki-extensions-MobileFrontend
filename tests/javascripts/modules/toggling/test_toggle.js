( function ( M, $ ) {

var $container,
	toggle = M.require( 'toggle' );

function makeSections() {
	return $( '<div>' ).appendTo( '#content' ).html(
			'<h2><span id="First_Section">First Section</span></h2>' +
			'<div><p>Text</p></div>' +

			'<h2 id="section_1"><a href="#foo">Dummy Link</a></h2>' +
			'<div></div>'
		);
}

QUnit.module( 'MobileFrontend toggle.js: wm_toggle_section', {
	setup: function() {
		$container = makeSections();
		this.$section0 = $container.find( 'h2' ).eq( 0 );
		this.sandbox.stub( M, 'isWideScreen' ).returns( false );
		toggle.enable();
		toggle.toggle( this.$section0 );
	},
	teardown: function() {
		window.location.hash = "#";
		$container.remove();
	}
});

QUnit.test( 'Toggle section', 5, function() {
	var $section = this.$section0,
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
	strictEqual( this.$section0.hasClass( 'openSection' ), true, 'check section is open' );
	toggle.reveal( 'First_Section' );
	strictEqual( this.$section0.hasClass( 'openSection' ), true, 'check section is still open' );
} );

QUnit.test( 'Reveal element', 2, function() {
	toggle.reveal( 'First_Section' );
	strictEqual( $( '#content_block_0' ).hasClass( 'openSection' ), true, 'check content is visible' );
	strictEqual( this.$section0.hasClass( 'openSection' ), true, 'check section is open' );
} );

QUnit.test( 'Clicking hash links', 2, function() {
	$( '[href=#First_Section]' ).trigger( 'click' );
	strictEqual( $( '#content_block_0' ).hasClass( 'openSection' ), true, 'check content is visible' );
	strictEqual( this.$section0.hasClass( 'openSection' ), true, 'check section is open' );
} );

QUnit.test( 'Mouseup on a heading toggles it', 2, function() {
	var $content = $( '#content_block_1' );

	strictEqual( $content.hasClass( 'openSection' ), false, 'check content is hidden at start' );

	$( '#section_1' ).trigger( M.tapEvent( 'mouseup' ) );

	strictEqual( $content.hasClass( 'openSection' ), true, 'check content is shown on a toggle' );
} );

QUnit.test( 'Verify aria attributes', 9, function () {
	var $section = $( '#section_1' ),
		$content = $( '#content_block_1' );

	// Test the initial state produced by the init function
	strictEqual( $content.hasClass( 'openSection' ), false, 'check content is hidden at start' );
	strictEqual( $content.attr( 'aria-pressed' ), 'false', 'check aria-pressed is false at start' );
	strictEqual( $content.attr( 'aria-expanded' ), 'false', 'check aria-expanded is false at start' );

	// Test what the toggle() function gives us when hiding the section
	$section.trigger( M.tapEvent( 'mouseup' ) );
	strictEqual( $content.hasClass( 'openSection' ), true, 'check content is visible after toggling' );
	strictEqual( $content.attr( 'aria-pressed' ), 'true', 'check aria-pressed is true after toggling' );
	strictEqual( $content.attr( 'aria-expanded' ), 'true', 'check aria-expanded is true after toggling' );

	// Test what the toggle() function gives us when showing the section
	$section.trigger( M.tapEvent( 'mouseup' ) );
	strictEqual( $content.hasClass( 'openSection' ), false, 'check content is hidden after toggling' );
	strictEqual( $content.attr( 'aria-pressed' ), 'false', 'check aria-pressed is false after toggling' );
	strictEqual( $content.attr( 'aria-expanded' ), 'false', 'check aria-expanded is false after toggling' );
} );

QUnit.module( 'MobileFrontend toggle.js: tablet mode', {
	setup: function() {
		$container = makeSections();
		this.sandbox.stub( M, 'isWideScreen' ).returns( true );
		toggle.enable();
	},
	teardown: function() {
		window.location.hash = "#";
		$container.remove();
	}
} );

QUnit.test( 'Open by default', 1, function() {
	strictEqual( $( '#content_block_1' ).hasClass( 'openSection' ), true, 'check section is visible at start' );
} );

QUnit.module( 'MobileFrontend toggle.js: user setting', {
	setup: function() {
		M.settings.saveUserSetting('expandSections', 'true', true);
		$container = makeSections();
		toggle.enable();
	},
	teardown: function() {
		window.location.hash = "#";
		$container.remove();
		M.settings.saveUserSetting('expandSections', '', true);
	}
} );

QUnit.test( 'Open by default', 1, function() {
	strictEqual( $( '#content_block_1' ).hasClass( 'openSection' ), true, 'check section is visible at start' );
} );

}( mw.mobileFrontend, jQuery ) );
