let
	sandbox,
	makeCarousel,
	View,
	util = require( '../../../src/mobile.startup/util' ),
	sinon = require( 'sinon' ),
	dom = require( '../utils/dom' ),
	mediaWiki = require( '../utils/mw' ),
	jQuery = require( '../utils/jQuery' ),
	oo = require( '../utils/oo' );

QUnit.module( 'MobileFrontend carousel.js', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		makeCarousel = require( '../../../src/mobile.mediaViewer/carousel' );
		View = require( '../../../src/mobile.startup/View' );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'renders view.$el if items[index] is a View', function ( assert ) {
	const carousel = makeCarousel( {
		items: [ new View( { el: util.parseHTML( '<div id="test"></div>' ) } ) ]
	} );

	assert.strictEqual( carousel.$el.find( '#test' ).length, 1, 'Renders $el of View' );
} );

QUnit.test( 'renders item if items[index] is NOT a View', function ( assert ) {
	const carousel = makeCarousel( {
		items: [ 'foo' ]
	} );

	assert.strictEqual( carousel.$el.text().trim(), 'foo', 'Renders item if not a View' );
} );

QUnit.test( 'renders inline styles on parent element', function ( assert ) {
	const carousel = makeCarousel( {
		items: [ 1, 2, 3 ],
		index: 0,
		style: { 'padding-top': '500px' }
	} );

	assert.strictEqual( carousel.$el.attr( 'style' ), 'padding-top: 500px;', 'Inline styles are rendered' );
} );

QUnit.test( 'when showNavigation: false, does not render navigation', function ( assert ) {
	const carousel = makeCarousel( {
		items: [ 1, 2, 3 ],
		index: 0,
		showNavigation: false
	} );

	assert.strictEqual(
		carousel.$el.find( '.slider-button' ).length,
		0,
		'Does not render navigation buttons when told not to'
	);
} );

QUnit.test( 'when showNavigation: true but < 2 items, does not render navigation', function ( assert ) {
	const carousel = makeCarousel( {
		items: [ 1 ],
		index: 0,
		showNavigation: true
	} );

	assert.strictEqual( carousel.$el.find( '.slider-button' ).length,
		0,
		'Does not render navigation buttons when item count < 2'
	);
} );

QUnit.test( 'when showNavigation: true and > 2 items, renders navigation with callbacks', function ( assert ) {
	const
		spy = sandbox.spy(),
		carousel = makeCarousel( {
			items: [ 1, 2, 3 ],
			index: 0,
			showNavigation: true,
			onSlide: spy
		} );

	assert.strictEqual(
		carousel.$el.find( '.slider-button' ).length,
		2,
		'Renders navigation buttons when item count > 2 and told to'
	);
	assert.strictEqual(
		spy.callCount,
		0,
		'callback hasn\'t been called before navigation buttons are clicked'
	);

	carousel.$el.find( '.slider-button.next' ).trigger( 'click' );

	assert.strictEqual(
		spy.callCount,
		1,
		'callback fired when next navigation buttons clicked'
	);
	assert.strictEqual(
		spy.getCall( 0 ).args[1],
		2,
		'callpack is fired with next slide as second param'
	);

	carousel.$el.find( '.slider-button.prev' ).trigger( 'click' );

	assert.strictEqual( spy.callCount, 2, 'callback fired when previous navigation button clicked' );
	assert.strictEqual( spy.getCall( 1 ).args[1], 3, 'callpack is fired with next slide as second param' );
} );

QUnit.test( 'when showNavigation: true and index is set to last item, onSlide callbacks work correctly', function ( assert ) {
	const
		spy = sandbox.spy(),
		carousel = makeCarousel( {
			items: [ 1, 2, 3 ],
			index: 2,
			showNavigation: true,
			onSlide: spy
		} );

	assert.strictEqual( spy.callCount, 0, 'callback hasn\'t been called before navigation buttons are clicked' );

	carousel.$el.find( '.slider-button.next' ).trigger( 'click' );

	assert.strictEqual( spy.callCount, 1, 'callback fired when next navigation buttons clicked' );
	assert.strictEqual( spy.getCall( 0 ).args[1], 1, 'callpack is fired with next slide as second param' );

	carousel.$el.find( '.slider-button.prev' ).trigger( 'click' );

	assert.strictEqual( spy.callCount, 2, 'callback fired when previous navigation button clicked' );
	assert.strictEqual( spy.getCall( 1 ).args[1], 2, 'callpack is fired with next slide as second param' );
} );

QUnit.test( 'onClick callback is fired when user clicks the carousel', function ( assert ) {
	const
		spy = sandbox.spy(),
		carousel = makeCarousel( {
			items: [ 1, 2, 3 ],
			index: 0,
			onClick: spy
		} );

	assert.strictEqual( spy.callCount, 0, 'callback not fired before user clicks the carousel' );
	carousel.$el.trigger( 'click' );
	assert.strictEqual( spy.callCount, 1, 'callback fired after user clicks the carousel' );
} );
