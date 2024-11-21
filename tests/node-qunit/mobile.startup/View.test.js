/* global $ */
const
	mw = require( '../utils/mw' ),
	mustache = require( '../utils/mustache' ),
	jQuery = require( '../utils/jQuery' ),
	dom = require( '../utils/dom' ),
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

QUnit.test( 'View', ( assert ) => {
	const el = document.createElement( 'div' ),
		view = new View( {
			el
		} );
	assert.strictEqual( view.$el[ 0 ].outerHTML, '<div class="view-border-box"></div>',
		'Views use el and treat as CSS selector. view border box by default' );
	assert.strictEqual( view.$el[ 0 ].tagName.toUpperCase(), 'DIV', 'assign proper jQuery object to $el' );
} );

QUnit.test( 'View, jQuery proxy functions', ( assert ) => {
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
	].forEach( ( prop ) => {
		const stub = sandbox.stub( view.$el, prop );
		view[ prop ]( 'test', 1 );
		assert.true( stub.calledWith( 'test', 1 ) );
		stub.restore();
	} );
} );

QUnit.test( 'View#preRender', ( assert ) => {
	class ChildView extends View {
		constructor( props ) {
			super( props );
		}

		get template() {
			return util.template( '<p>{{text}}</p>' );
		}

		preRender() {
			this.options.text = 'hello';
		}
	}

	const view = new ChildView();
	assert.strictEqual( view.$el.html(), '<p>hello</p>', 'manipulate template data' );
} );

QUnit.test( 'View#postRender', ( assert ) => {
	const spy = sandbox.spy();
	class ChildView extends View {
		constructor( props ) {
			super( props );
		}

		postRender() {
			spy();
		}
	}

	// eslint-disable-next-line no-new
	new ChildView();
	assert.strictEqual( spy.callCount, 1, 'invoke postRender' );
} );

QUnit.test( 'View#delegateEvents', ( assert ) => {
	class EventsView extends View {
		constructor( props ) {
			super(
				util.extend(
					{
						events: {
							'click p span': function ( ev ) {
								ev.preventDefault();
								assert.true( true, 'Span was clicked and handled' );
							},
							'click p': 'onParagraphClick',
							click: 'onClick'
						}
					},
					props
				)
			);
		}

		get template() {
			return util.template( '<p><span>test</span></p>' );
		}

		onParagraphClick( ev ) {
			ev.preventDefault();
			assert.true( true, 'Paragraph was clicked and handled' );
		}

		onClick( ev ) {
			ev.preventDefault();
			assert.true( true, 'View was clicked and handled' );
		}
	}

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

QUnit.test( 'View#render (with isTemplateMode)', ( assert ) => {
	const $parent = $( '<div>' );
	class TemplateModeView extends View {
		get template() {
			return util.template( '<p class="foo"><span>{{text}}</span></p>' );
		}

		get isTemplateMode() {
			return true;
		}
	}

	class ContainerView extends View {
		constructor() {
			super( { className: 'bar' } );
		}

		get template() {
			return util.template( '<p class="foo"><span>test</span></p>' );
		}
	}

	const view = new TemplateModeView();
	const textFirstRun = view.$el.text();
	const view2 = new ContainerView();
	view.render();
	view2.render();
	// attach to the DOM
	view.$el.appendTo( $parent );
	// and then do a second render...
	view.render( { text: 'hello' } );
	assert.true( view.$el.hasClass( 'foo' ) );
	assert.true( view2.$el.hasClass( 'bar' ) );
	assert.strictEqual( textFirstRun, '', 'first run, no text defined' );
	assert.strictEqual( view.$el.text(), 'hello', 'second run, text has been defined' );
	assert.strictEqual( view.$el.parent( $parent ).length, 1,
		'A re-rendered view thats attached to the DOM remains attached to the DOM' );
} );

QUnit.test( 'View#render events (with isTemplateMode)', ( assert ) => {
	class TemplateModeView extends View {
		constructor( props ) {
			super(
				util.extend( { events: { 'click span': 'onClick' } }, props )
			);
		}

		onClick() {
			this.$el.empty().text( 'hello world' );
		}

		get template() {
			return util.template( '<p class="foo"><span>test</span></p>' );
		}

		get isTemplateMode() {
			return true;
		}
	}

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

QUnit.test( 'View with className option', ( assert ) => {
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
	].forEach( ( test ) => {
		assert.strictEqual( test[0].$el.attr( 'class' ), test[1], test[2] );
	} );
} );

QUnit.test( 'View.make()', ( assert ) => {
	const view = View.make( { className: 'foo' }, [ util.parseHTML( '<div>' ).text( 'hello' ) ] );
	assert.strictEqual( view.$el.find( '> div' ).text().trim(), 'hello', 'view created with element' );
} );
