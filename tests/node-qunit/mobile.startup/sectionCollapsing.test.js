const sinon = require( 'sinon' );
const dom = require( '../utils/dom' );
const jQuery = require( '../utils/jQuery' );

let sectionCollapsing;
let sandbox;
let browser;

QUnit.module( 'MobileFrontend sectionCollapsing.js', {
	beforeEach: function () {
		sandbox = sinon.createSandbox();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		sectionCollapsing = require( '../../../src/mobile.startup/sectionCollapsing' );
		browser = require( '../../../src/mobile.startup/Browser' ).getSingleton();
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

const ARTICLE_HTML = `<div class="mw-parser-output">
	<section>
		<div id="a" class="mw-heading">
			<h2 id="History">History</h2>
			<span class="mw-editsection"><a>edit</a></span>
		</div>
		<div id="b">
			<p>Content</p>
		</div>
	</section>
`;

QUnit.test( 'init() - article pages', ( assert ) => {
	sandbox.stub( browser, 'isWideScreen' ).returns( false );
	const container = document.createElement( 'div' );
	container.innerHTML = ARTICLE_HTML;
	sectionCollapsing.init( container );
	assert.true(
		container.querySelector( '#b' ).classList.contains( 'mf-collapsible-content' ),
		'section body marked as collapsible'
	);
	assert.strictEqual(
		container.querySelectorAll( '.mf-icon' ).length,
		1,
		'An icon was added to the heading'
	);
	assert.strictEqual(
		container.querySelector( 'h2' ).textContent,
		'History',
		'The heading text was was not changed'
	);
	const heading = container.querySelector( '.mw-heading' );
	assert.strictEqual( heading.getAttribute( 'aria-expanded' ), 'false', 'collasped by default' );
	heading.dispatchEvent( new Event( 'click', {
		bubbles: true
	} ) );
	assert.strictEqual( heading.getAttribute( 'aria-expanded' ), 'true', 'section is now expanded' );
} );

QUnit.test( 'init() - article pages on tablet page', ( assert ) => {
	sandbox.stub( browser, 'isWideScreen' ).returns( true );
	const container = document.createElement( 'div' );
	container.innerHTML = ARTICLE_HTML;
	sectionCollapsing.init( container );
	assert.true(
		container.querySelector( '#b' ).classList.contains( 'mf-collapsible-content' ),
		'section body marked as collapsible'
	);
	const heading = container.querySelector( '.mw-heading' );
	assert.strictEqual( heading.getAttribute( 'aria-expanded' ), 'true', 'expanded by default' );
} );

QUnit.test( 'init() - talk pages', ( assert ) => {
	sandbox.stub( browser, 'isWideScreen' ).returns( false );
	const container = document.createElement( 'div' );
	container.innerHTML = `<div class="mw-parser-output">
	<section>
		<div id="a" class="mw-heading">
			<h2 id="Western_food_in_Asia"
				data-mw-thread-id="h-Western_food_in_Asia-2020-09-11T19:30:00.000Z">
				<span data-mw-comment-start="" id="h-Western_food_in_Asia-2020-09-11T19:30:00.000Z"></span>
				Western food in Asia
				<span data-mw-comment-end="h-Western_food_in_Asia-2020-09-11T19:30:00.000Z"></span>
			</h2>
			<span class="mw-editsection"><a>edit</a></span>
			<div class="ext-discussiontools-init-section-bar">
				<div class="ext-discussiontools-init-section-metadata"></div>
				<div class="ext-discussiontools-init-section-actions"></div>
			</div>
		</div>
		<div id="b">
			<p>Content</p>
		</div>
	</section>
`;
	sectionCollapsing.init( container );
	assert.strictEqual(
		container.querySelectorAll( 'h2 span[data-mw-comment-start], h2 span[data-mw-comment-end]' ).length,
		2,
		'span[data-mw-comment-start] and span[data-mw-comment-end] are preserved'
	);
	assert.strictEqual(
		container.querySelectorAll( 'span.mf-icon' ).length,
		1,
		'Icon is added'
	);

	const heading = container.querySelector( '.mw-heading' );
	assert.strictEqual( heading.getAttribute( 'aria-expanded' ), 'false', 'collapsed by default' );
	container.querySelector( '.mw-editsection a' ).dispatchEvent( new Event( 'click', {
		bubbles: true
	} ) );
	assert.strictEqual( heading.getAttribute( 'aria-expanded' ), 'false', 'was not impacted by click' );
} );
