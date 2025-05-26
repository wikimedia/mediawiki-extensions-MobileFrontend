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

		browser = require( '../../../src/mobile.startup/Browser' ).getSingleton();
		Toggler = require( '../../../src/mobile.startup/Toggler' );

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
		$content = this.$container.find( '.collapsible-block' ).eq( 0 );

	toggle.toggle( $section );

	assert.strictEqual( $section.hasClass( 'open-block' ), true, 'open-block class present' );

	toggle.toggle( $section );

	assert.strictEqual( $content.hasClass( 'open-block' ), false, 'check content gets closed on a toggle' );
	assert.strictEqual( $section.hasClass( 'open-block' ), false, 'check section is closed' );
	// Perform second toggle
	toggle.toggle( $section );
	assert.strictEqual( $content.hasClass( 'open-block' ), true, 'check content reopened' );
	assert.strictEqual( $section.hasClass( 'open-block' ), true, 'check section has reopened' );
} );

QUnit.test( 'Mobile mode - Clicking a hash link to reveal an already open section', function ( assert ) {
	const
		toggle = new Toggler( {
			eventBus: new OO.EventEmitter(),
			$container: this.$container,
			prefix: '',
			page: this.page
		} );

	toggle.toggle( this.$section0 );

	assert.strictEqual( this.$section0.hasClass( 'open-block' ), true, 'check section is open' );
	toggle.reveal( 'First_Section' );
	assert.strictEqual( this.$section0.hasClass( 'open-block' ), true, 'check section is still open' );
} );

QUnit.test( 'Mobile mode - Reveal element', function ( assert ) {
	const
		toggle = new Toggler( {
			eventBus: new OO.EventEmitter(),
			$container: this.$container,
			prefix: '',
			page: this.page
		} );

	toggle.toggle( this.$section0 );

	toggle.reveal( 'First_Section' );
	assert.strictEqual( this.$container.find( '.collapsible-block' ).eq( 0 ).hasClass( 'open-block' ), true, 'check content is visible' );
	assert.strictEqual( this.$section0.hasClass( 'open-block' ), true, 'check section is open' );
} );

QUnit.test( 'Mobile mode - Clicking hash links', function ( assert ) {
	const
		toggle = new Toggler( {
			eventBus: new OO.EventEmitter(),
			$container: this.$container,
			prefix: '',
			page: this.page
		} );

	toggle.toggle( this.$section0 );

	this.$container.find( '[href="#First_Section"]' ).trigger( 'click' );
	assert.strictEqual( this.$container.find( '.collapsible-block' ).eq( 0 ).hasClass( 'open-block' ), true, 'check content is visible' );
	assert.strictEqual( this.$section0.hasClass( 'open-block' ), true, 'check section is open' );
} );

QUnit.test( 'Mobile mode - Tap event toggles section', function ( assert ) {
	const
		toggle = new Toggler( {
			eventBus: new OO.EventEmitter(),
			$container: this.$container,
			prefix: '',
			page: this.page
		} ),
		$content = this.$container.find( '.collapsible-block' ).eq( 1 );

	toggle.toggle( this.$section0 );

	assert.strictEqual( $content.hasClass( 'open-block' ), false, 'check content is hidden at start' );

	this.$container.find( '#section_1' ).trigger( 'click' );

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
		$section = this.$container.find( '#section_1' ),
		$headingWrapper = $section.parent(),
		$content = this.$container.find( '.collapsible-block' ).eq( 1 );

	toggle.toggle( this.$section0 );

	// Test the initial state produced by the init function
	assert.strictEqual( $content.hasClass( 'open-block' ), false, 'check content is hidden at start' );
	assert.strictEqual( $headingWrapper.attr( 'aria-expanded' ), 'false', 'check aria-expanded is false at start' );

	// Test what the toggle() function gives us when hiding the section
	$section.trigger( 'click' );
	assert.strictEqual( $content.hasClass( 'open-block' ), true, 'check content is visible after toggling' );
	assert.strictEqual( $headingWrapper.attr( 'aria-expanded' ), 'true', 'check aria-expanded is true after toggling' );

	// Test what the toggle() function gives us when showing the section
	$section.trigger( 'click' );
	assert.strictEqual( $content.hasClass( 'open-block' ), false, 'check content is hidden after toggling' );
	assert.strictEqual( $headingWrapper.attr( 'aria-expanded' ), 'false', 'check aria-expanded is false after toggling' );
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
QUnit.test( 'Accessibility - Pressing space/ enter toggles a heading', function ( assert ) {
	const $section = this.$container.find( '#section_1' ),
		ev = $.Event( 'keypress' );

	browser.isWideScreen.returns( false );

	/* eslint-disable-next-line no-new */
	new Toggler( {
		eventBus: new OO.EventEmitter(),
		$container: this.$container,
		prefix: '',
		page: this.page
	} );

	const $content = this.$container.find( '.collapsible-block' ).eq( 1 );

	assert.strictEqual( $content.hasClass( 'open-block' ), false, 'check content is hidden at start' );

	// Open the section with pressing space
	ev.which = 32;
	$section.trigger( ev );
	assert.strictEqual( $content.hasClass( 'open-block' ), true, 'check content is shown after pressing space' );

	// Enter should close the section again
	ev.which = 13;
	$section.trigger( ev );
	assert.strictEqual( $content.hasClass( 'open-block' ), false, 'check content is hidden after pressing enter' );
} );

QUnit.test( 'Clicking a link within a heading isn\'t triggering a toggle', function ( assert ) {

	const $section = $( '#section_1' ),
		$content = $( '.collapsible-block' ).eq( 1 );

	/* eslint-disable-next-line no-new */
	new Toggler( {
		eventBus: new OO.EventEmitter(),
		$container: this.$container,
		prefix: '',
		page: this.page
	} );

	assert.strictEqual( $content.hasClass( 'open-block' ), false, 'check content is hidden at start' );

	$section.find( '> a' ).eq( 0 ).trigger( 'mouseup' );
	assert.strictEqual( $content.hasClass( 'open-block' ), false, 'check content is still being hidden after clicking on the link' );
} );

QUnit.test( 'MobileFrontend toggle.js - T320753: Presence of class disables toggling.', function ( assert ) {
	const toggler = new Toggler( {
		eventBus: new OO.EventEmitter(),
		$container: this.$container,
		prefix: '',
		page: this.page
	} );
	const $heading = this.$container.find( 'h2' );
	assert.strictEqual(
		toggler.toggle( $heading ),
		true,
		'toggle is functional'
	);
	$heading.addClass( 'collapsible-heading-disabled' );
	assert.strictEqual(
		toggler.toggle( $heading ),
		false,
		'Toggle is not functional when collapsible-heading-disabled class is present'
	);
} );
