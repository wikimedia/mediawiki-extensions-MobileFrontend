/* global $ */
const
	sinon = require( 'sinon' ),
	dom = require( '../utils/dom' ),
	jQuery = require( '../utils/jQuery' ),
	oo = require( '../utils/oo' ),
	mediawiki = require( '../utils/mw' ),
	mustache = require( '../utils/mustache' ),
	sectionTemplate = `
		<div class="mw-heading mw-heading2 section-heading">
			<h2 id="First_Section">
				First Section
			</h2>
		</div>
		<section>
			<p>Text</p>
		</section>
		<div class="mw-heading mw-heading2 section-heading">
			<h2 id="section_1">
				<a href="#foo">Dummy Link</a>
			</h2>
		</div>
		<section></section>
`;
let
	sandbox,
	browser,
	Toggler;

/**
 * Mobile toggling
 */
QUnit.module( 'MobileFrontend Toggler.js', {
	beforeEach: function () {
		sandbox = sinon.createSandbox();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediawiki.setUp( sandbox, global );
		mustache.setUp( sandbox, global );

		// Make Node constants available for Toggler.js _createHeadingButton method
		// Node.js test environment doesn't have Node constants globally available
		const NodeConstants = {
			TEXT_NODE: 3,
			ELEMENT_NODE: 1
		};
		global.Node = NodeConstants;
		window.Node = NodeConstants;

		browser = require( '../../../src/mobile.startup/Browser' ).getSingleton();
		Toggler = require( '../../../src/mobile.init/Toggler' );

		sandbox.stub( browser, 'isWideScreen' ).returns( false );
		sandbox.stub( window, 'scrollTo' );

		this.page = { title: 'Toggle test' };
		this.$container = $( '<article>' ).html( sectionTemplate );
		this.$section0 = this.$container.find( '.section-heading' ).eq( 0 );
		this.title = this.page.title;
		this.headline = this.$section0.find( 'span' ).attr( 'id' );
		this._session = mw.storage.session;
		mw.storage.session = {
			get: () => {},
			getObject: () => {},
			set: () => {},
			setObject: () => {},
			remove: () => {}
		};
	},
	afterEach: function () {
		mw.storage.remove( 'expandSections' );
		mw.storage.session.remove( 'expandedSections' );
		mw.storage.session = this._session;
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'Mobile mode - Toggle section', function ( assert ) {
	const
		toggle = new Toggler( {
			eventBus: new OO.EventEmitter(),
			$container: this.$container,
			prefix: '',
			page: this.page
		} ),
		$section = this.$section0,
		$headingElement = $section.find( 'h1, h2, h3, h4, h5, h6' ).first(),
		$content = this.$container.find( '.collapsible-block' ).eq( 0 );

	toggle.toggle( $section );

	assert.strictEqual( $headingElement.hasClass( 'open-block' ), true, 'open-block class present on heading element' );

	toggle.toggle( $section );

	assert.strictEqual( $content.hasClass( 'open-block' ), false, 'check content gets closed on a toggle' );
	assert.strictEqual( $headingElement.hasClass( 'open-block' ), false, 'check heading element is closed' );
	// Perform second toggle
	toggle.toggle( $section );
	assert.strictEqual( $content.hasClass( 'open-block' ), true, 'check content reopened' );
	assert.strictEqual( $headingElement.hasClass( 'open-block' ), true, 'check heading element has reopened' );
} );

QUnit.test( 'Mobile mode - Clicking a hash link to reveal an already open section', function ( assert ) {
	const
		toggle = new Toggler( {
			eventBus: new OO.EventEmitter(),
			$container: this.$container,
			prefix: '',
			page: this.page
		} ),
		$headingElement = this.$section0.find( 'h1, h2, h3, h4, h5, h6' ).first();

	toggle.toggle( this.$section0 );

	assert.strictEqual( $headingElement.hasClass( 'open-block' ), true, 'check heading element is open' );
	toggle.reveal( 'First_Section' );
	assert.strictEqual( $headingElement.hasClass( 'open-block' ), true, 'check heading element is still open' );
} );

QUnit.test( 'Mobile mode - Reveal element', function ( assert ) {
	const
		toggle = new Toggler( {
			eventBus: new OO.EventEmitter(),
			$container: this.$container,
			prefix: '',
			page: this.page
		} ),
		$headingElement = this.$section0.find( 'h1, h2, h3, h4, h5, h6' ).first();

	toggle.toggle( this.$section0 );

	toggle.reveal( 'First_Section' );
	assert.strictEqual( this.$container.find( '.collapsible-block' ).eq( 0 ).hasClass( 'open-block' ), true, 'check content is visible' );
	assert.strictEqual( $headingElement.hasClass( 'open-block' ), true, 'check heading element is open' );
} );

QUnit.test( 'Mobile mode - Clicking hash links', function ( assert ) {
	const
		toggle = new Toggler( {
			eventBus: new OO.EventEmitter(),
			$container: this.$container,
			prefix: '',
			page: this.page
		} ),
		$headingElement = this.$section0.find( 'h1, h2, h3, h4, h5, h6' ).first();

	toggle.toggle( this.$section0 );

	this.$container.find( '[href="#First_Section"]' ).trigger( 'click' );
	assert.strictEqual( this.$container.find( '.collapsible-block' ).eq( 0 ).hasClass( 'open-block' ), true, 'check content is visible' );
	assert.strictEqual( $headingElement.hasClass( 'open-block' ), true, 'check heading element is open' );
} );

QUnit.test( 'Mobile mode - Tap event toggles section', function ( assert ) {
	const
		toggle = new Toggler( {
			eventBus: new OO.EventEmitter(),
			$container: this.$container,
			prefix: '',
			page: this.page
		} ),
		$section1 = this.$container.find( '.section-heading' ).eq( 1 ),
		$button = $section1.find( 'button.collapsible-heading-button' ),
		$content = this.$container.find( '.collapsible-block' ).eq( 1 );

	toggle.toggle( this.$section0 );

	assert.strictEqual( $content.hasClass( 'open-block' ), false, 'check content is hidden at start' );

	$button.trigger( 'click' );

	assert.strictEqual( $content.hasClass( 'open-block' ), true, 'check content is shown on a toggle' );
} );

QUnit.test( 'Accessibility - Verify ARIA attributes', function ( assert ) {
	const
		toggle = new Toggler( {
			eventBus: new OO.EventEmitter(),
			$container: this.$container,
			prefix: '',
			page: this.page
		} ),
		$section = this.$container.find( '#section_1' ).parent(),
		$button = $section.find( 'button.collapsible-heading-button' ),
		$content = this.$container.find( '.collapsible-block' ).eq( 1 );

	toggle.toggle( this.$section0 );

	// Test the initial state produced by the init function
	assert.strictEqual( $content.hasClass( 'open-block' ), false, 'check content is hidden at start' );
	assert.strictEqual( $button.attr( 'aria-expanded' ), 'false', 'check aria-expanded is false at start on button' );

	// Test what the toggle() function gives us when hiding the section
	$button.trigger( 'click' );
	assert.strictEqual( $content.hasClass( 'open-block' ), true, 'check content is visible after toggling' );
	assert.strictEqual( $button.attr( 'aria-expanded' ), 'true', 'check aria-expanded is true after toggling on button' );

	// Test what the toggle() function gives us when showing the section
	$button.trigger( 'click' );
	assert.strictEqual( $content.hasClass( 'open-block' ), false, 'check content is hidden after toggling' );
	assert.strictEqual( $button.attr( 'aria-expanded' ), 'false', 'check aria-expanded is false after toggling on button' );
} );

/**
 * Tablet toggling
 */
QUnit.test( 'Tablet mode - Open by default', function ( assert ) {
	browser.isWideScreen.returns( true );

	/* eslint-disable-next-line no-new */
	new Toggler( {
		eventBus: new OO.EventEmitter(),
		$container: this.$container,
		prefix: '',
		page: this.page
	} );

	assert.strictEqual( this.$container.find( '.collapsible-block' ).eq( 1 ).hasClass( 'open-block' ),
		true, 'check section is visible at start' );
} );

/**
 * Expand sections user setting
 */
QUnit.test( 'Tablet mode - Open by default 2', function ( assert ) {
	browser.isWideScreen.returns( true );

	/* eslint-disable-next-line no-new */
	new Toggler( {
		eventBus: new OO.EventEmitter(),
		$container: this.$container,
		prefix: '',
		page: this.page
	} );

	assert.strictEqual( this.$container.find( '.collapsible-block' ).eq( 1 ).hasClass( 'open-block' ), true, 'check section is visible at start' );
} );

/**
 * Accessibility
 */
QUnit.test( 'Accessibility - Button supports keyboard interaction (Enter/Space trigger click)', function ( assert ) {
	const $section = this.$container.find( '#section_1' ).parent();

	browser.isWideScreen.returns( false );

	/* eslint-disable-next-line no-new */
	new Toggler( {
		eventBus: new OO.EventEmitter(),
		$container: this.$container,
		prefix: '',
		page: this.page
	} );

	const $button = $section.find( 'button.collapsible-heading-button' ),
		$content = this.$container.find( '.collapsible-block' ).eq( 1 );

	assert.strictEqual( $content.hasClass( 'open-block' ), false, 'check content is hidden at start' );

	// Test that the click handler works.
	$button.trigger( 'click' );
	assert.strictEqual( $content.hasClass( 'open-block' ), true, 'check content is shown after click (keyboard triggers click)' );

	$button.trigger( 'click' );
	assert.strictEqual( $content.hasClass( 'open-block' ), false, 'check content is hidden after click again' );
} );

QUnit.test( 'Clicking a link within a heading isn\'t triggering a toggle', function ( assert ) {

	const $section = this.$container.find( '#section_1' ).parent(),
		$button = $section.find( 'button.collapsible-heading-button' ),
		$content = this.$container.find( '.collapsible-block' ).eq( 1 );

	/* eslint-disable-next-line no-new */
	new Toggler( {
		eventBus: new OO.EventEmitter(),
		$container: this.$container,
		prefix: '',
		page: this.page
	} );

	assert.strictEqual( $content.hasClass( 'open-block' ), false, 'check content is hidden at start' );

	$button.find( 'a' ).eq( 0 ).trigger( 'mouseup' );
	assert.strictEqual( $content.hasClass( 'open-block' ), false, 'check content is still being hidden after clicking on the link' );
} );

QUnit.test( 'MobileFrontend toggle.js - T320753: Presence of class disables toggling.', function ( assert ) {
	const toggler = new Toggler( {
		eventBus: new OO.EventEmitter(),
		$container: this.$container,
		prefix: '',
		page: this.page
	} );
	const $heading = this.$container.find( '.section-heading' ).eq( 0 );
	assert.strictEqual(
		toggler.toggle( $heading ),
		true,
		'toggle is functional'
	);
	const $button = $heading.find( 'button.collapsible-heading-button' );
	$button.addClass( 'collapsible-heading-button-disabled' );
	assert.strictEqual(
		toggler.toggle( $heading ),
		false,
		'Toggle is not functional when collapsible-heading-button-disabled class is present'
	);
} );
