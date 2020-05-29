/* global $ */
const
	mw = require( '../utils/mw' ),
	mustache = require( '../utils/mustache' ),
	jQuery = require( '../utils/jQuery' ),
	dom = require( '../utils/dom' ),
	mfExtend = require( '../../../src/mobile.startup/mfExtend' ),
	util = require( '../../../src/mobile.startup/util' ),
	oo = require( '../utils/oo' ),
	sinon = require( 'sinon' );
let
	View;
/** @type {sinon.SinonSandbox} */ let sandbox;

QUnit.module( 'MobileFrontend mobile.startup/View', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mw.setUp( sandbox, global );
		mustache.setUp( sandbox, global );

		View = require( '../../../src/mobile.startup/View' );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'View', function ( assert ) {
	const el = document.createElement( 'div' ),
		view = new View( {
			el
		} );
	assert.strictEqual( view.$el[ 0 ].outerHTML, '<div class="view-border-box"></div>',
		'Views use el and treat as CSS selector. view border box by default' );
	assert.strictEqual( view.$el[ 0 ].tagName.toUpperCase(), 'DIV', 'assign proper jQuery object to $el' );
} );

QUnit.test( 'View, jQuery proxy functions', function ( assert ) {
	const view = new View( {
		el: 'body'
	} );
	[
		'append',
		'prepend',
		'appendTo',
		'prependTo',
		'after',
		'before',
		'insertAfter',
		'insertBefore',
		'remove',
		'detach'
	].forEach( function ( prop ) {
		const stub = sandbox.stub( view.$el, prop );
		view[ prop ]( 'test', 1 );
		assert.ok( stub.calledWith( 'test', 1 ) );
		stub.restore();
	} );
} );

QUnit.test( 'View#preRender', function ( assert ) {
	function ChildView() {
		View.apply( this, arguments );
	}

	mfExtend( ChildView, View, {
		template: util.template( '<p>{{text}}</p>' ),
		preRender: function () {
			this.options.text = 'hello';
		}
	} );

	const view = new ChildView();
	assert.strictEqual( view.$el.html(), '<p>hello</p>', 'manipulate template data' );
} );

QUnit.test( 'View#postRender', function ( assert ) {
	const spy = sandbox.spy();
	function ChildView() {
		View.apply( this, arguments );
	}

	mfExtend( ChildView, View, {
		postRender: function () {
			spy();
		}
	} );

	// eslint-disable-next-line no-new
	new ChildView();
	assert.strictEqual( spy.callCount, 1, 'invoke postRender' );
} );

QUnit.test( 'View#delegateEvents', function ( assert ) {

	function EventsView( props ) {
		View.call(
			this,
			util.extend(
				{
					events: {
						'click p span': function ( ev ) {
							ev.preventDefault();
							assert.ok( true, 'Span was clicked and handled' );
						},
						'click p': 'onParagraphClick',
						click: 'onClick'
					}
				},
				props
			)
		);
	}

	mfExtend( EventsView, View, {
		template: util.template( '<p><span>test</span></p>' ),
		onParagraphClick: function ( ev ) {
			ev.preventDefault();
			assert.ok( true, 'Paragraph was clicked and handled' );
		},
		onClick: function ( ev ) {
			ev.preventDefault();
			assert.ok( true, 'View was clicked and handled' );
		}
	} );

	const view = new EventsView();
	view.appendTo( 'body' );
	// Check if events are set and handlers called
	view.$el.find( 'span' ).trigger( 'click' );
	view.$el.find( 'p' ).trigger( 'click' );
	view.$el.trigger( 'click' );
	// Check if events can be unset and handlers are not called
	view.undelegateEvents();
	view.$el.find( 'span' ).trigger( 'click' );
	view.$el.find( 'p' ).trigger( 'click' );
	view.$el.trigger( 'click' );
} );

QUnit.test( 'View#render (with isTemplateMode)', function ( assert ) {
	const $parent = $( '<div>' );
	function TemplateModeView() {
		View.apply( this, arguments );
	}

	mfExtend( TemplateModeView, View, {
		template: util.template( '<p class="foo"><span>{{text}}</span></p>' ),
		isTemplateMode: true
	} );

	function ContainerView() {
		View.call( this, { className: 'bar' } );
	}

	mfExtend( ContainerView, View, {
		template: util.template( '<p class="foo"><span>test</span></p>' )
	} );

	const view = new TemplateModeView();
	const textFirstRun = view.$el.text();
	const view2 = new ContainerView();
	view.render();
	view2.render();
	// attach to the DOM
	view.$el.appendTo( $parent );
	// and then do a second render...
	view.render( { text: 'hello' } );
	assert.ok( view.$el.hasClass( 'foo' ) );
	assert.ok( view2.$el.hasClass( 'bar' ) );
	assert.strictEqual( textFirstRun, '', 'first run, no text defined' );
	assert.strictEqual( view.$el.text(), 'hello', 'second run, text has been defined' );
	assert.strictEqual( view.$el.parent( $parent ).length, 1,
		'A re-rendered view thats attached to the DOM remains attached to the DOM' );
} );

QUnit.test( 'View#render events (with isTemplateMode)', function ( assert ) {
	function TemplateModeView( props ) {
		View.call(
			this,
			util.extend( { events: { 'click span': 'onClick' } }, props )
		);
	}

	mfExtend( TemplateModeView, View, {
		onClick: function () {
			this.$el.empty().text( 'hello world' );
		},
		template: util.template( '<p class="foo"><span>test</span></p>' ),
		isTemplateMode: true
	} );

	const view = new TemplateModeView();
	// trigger event
	view.$el.find( 'span' ).trigger( 'click' );
	assert.strictEqual( view.$el.text(), 'hello world', 'event was called' );
	assert.strictEqual( view.$el.find( 'span' ).length, 0, 'span disappeared' );

	// do same again but call render twice
	const view2 = new TemplateModeView();
	// force a re-render
	view2.render();
	// trigger event to show events didn't get lost
	view2.$el.find( 'span' ).trigger( 'click' );
	assert.strictEqual( view2.$el.text(), 'hello world', 'event was called' );
	assert.strictEqual( view2.$el.find( 'span' ).length, 0, 'span disappeared' );
} );

QUnit.test( 'View with className option', function ( assert ) {
	[
		[
			new View(),
			'view-border-box',
			'className not defined on a normal View without options and isBorderBox is default'
		],
		[
			new View( {} ),
			'view-border-box',
			'className not defined on a normal View with empty options and isBorderBox is default'
		],
		[
			new View( {
				className: 'banana'
			} ),
			'banana view-border-box',
			'option is passed to View (along with default isBorderBox property)'
		],
		[
			new View( { isBorderBox: false } ),
			undefined,
			'Passing isBorderBox option removes default view-border-box class'
		],
		[
			new View( { isBorderBox: true } ),
			'view-border-box',
			'Passing isBorderBox option as true retains default view-border-box class'
		]
	].forEach( function ( test ) {
		assert.strictEqual( test[0].$el.attr( 'class' ), test[1], test[2] );
	} );
} );

QUnit.test( 'View.make()', function ( assert ) {
	const view = View.make( { className: 'foo' }, [ util.parseHTML( '<div>' ).text( 'hello' ) ] );
	assert.strictEqual( view.$el.find( '> div' ).text().trim(), 'hello', 'view created with element' );
} );
