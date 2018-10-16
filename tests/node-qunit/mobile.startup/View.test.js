/* global $ */
var
	Hogan = require( 'hogan.js' ),
	jQuery = require( '../utils/jQuery' ),
	mfExtend = 	require( '../../../src/mobile.startup/mfExtend' ),
	oo = require( '../utils/oo' ),
	sinon = require( 'sinon' ),
	View;
/** @type {sinon.SinonSandbox} */ var sandbox; // eslint-disable-line one-var

QUnit.module( 'MobileFrontend mobile.startup/View', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );

		View = require( '../../../src/mobile.startup/View' );
	},
	afterEach: function () { sandbox.restore(); }
} );

QUnit.test( 'View', function ( assert ) {
	var view = new View( {
		el: 'body'
	} );
	assert.ok( view.$el instanceof $, 'assign jQuery object to $el' );
	assert.strictEqual( view.$el[ 0 ].tagName.toUpperCase(), 'BODY', 'assign proper jQuery object to $el' );
} );

QUnit.test( 'View, jQuery proxy functions', function ( assert ) {
	var view = new View( {
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
		var stub = sandbox.stub( view.$el, prop );
		view[ prop ]( 'test', 1 );
		assert.ok( stub.calledWith( 'test', 1 ) );
		stub.restore();
	} );
} );

QUnit.test( 'View#preRender', function ( assert ) {
	var view;
	function ChildView() {
		View.apply( this, arguments );
	}

	mfExtend( ChildView, View, {
		template: Hogan.compile( '<p>{{text}}</p>' ),
		preRender: function () {
			this.options.text = 'hello';
		}
	} );

	view = new ChildView();
	assert.strictEqual( view.$el.html(), '<p>hello</p>', 'manipulate template data' );
} );

QUnit.test( 'View#postRender', function ( assert ) {
	var spy = sandbox.spy();
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

	var view;
	function EventsView() {
		View.apply( this, arguments );
	}

	mfExtend( EventsView, View, {
		template: Hogan.compile( '<p><span>test</span></p>' ),
		events: {
			'click p span': function ( ev ) {
				ev.preventDefault();
				assert.ok( true, 'Span was clicked and handled' );
			},
			'click p': 'onParagraphClick',
			click: 'onClick'
		},
		onParagraphClick: function ( ev ) {
			ev.preventDefault();
			assert.ok( true, 'Paragraph was clicked and handled' );
		},
		onClick: function ( ev ) {
			ev.preventDefault();
			assert.ok( true, 'View was clicked and handled' );
		}
	} );

	view = new EventsView();
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
	var view, view2;
	function TemplateModeView() {
		View.apply( this, arguments );
	}

	mfExtend( TemplateModeView, View, {
		template: Hogan.compile( '<p class="foo"><span>test</span></p>' ),
		isTemplateMode: true
	} );

	function ContainerView() {
		View.apply( this, arguments );
	}

	mfExtend( ContainerView, View, {
		className: 'bar',
		template: Hogan.compile( '<p class="foo"><span>test</span></p>' )
	} );

	view = new TemplateModeView();
	view2 = new ContainerView();
	view.render();
	view2.render();
	assert.ok( view.$el.hasClass( 'foo' ) );
	assert.ok( view2.$el.hasClass( 'bar' ) );
} );

QUnit.test( 'View#render events (with isTemplateMode)', function ( assert ) {
	var view;
	function TemplateModeView() {
		View.apply( this, arguments );
	}

	mfExtend( TemplateModeView, View, {
		events: {
			'click span': 'onClick'
		},
		onClick: function () {
			this.$el.empty().text( 'hello world' );
		},
		template: Hogan.compile( '<p class="foo"><span>test</span></p>' ),
		isTemplateMode: true
	} );

	view = new TemplateModeView();
	// trigger event
	view.$( 'span' ).trigger( 'click' );
	assert.strictEqual( view.$el.text(), 'hello world', 'event was called' );
	assert.strictEqual( view.$( 'span' ).length, 0, 'span disappeared' );

	// do same again but call render twice
	view = new TemplateModeView();
	// force a re-render
	view.render();
	// trigger event to show events didn't get lost
	view.$( 'span' ).trigger( 'click' );
	assert.strictEqual( view.$el.text(), 'hello world', 'event was called' );
	assert.strictEqual( view.$( 'span' ).length, 0, 'span disappeared' );
} );
