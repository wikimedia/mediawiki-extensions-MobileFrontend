( function( M, $ ) {

var View = M.require( 'view' );

module( 'MobileFrontend view' );

test( 'View', function() {
	var view = new View( { el: 'body' } );
	ok( view.$el instanceof $, 'assign jQuery object to $el' );
	strictEqual( view.$el[0].tagName.toUpperCase(), 'BODY', 'assign proper jQuery object to $el' );
} );

test( 'View, jQuery proxy functions', function() {
	var view = new View( { el: 'body' } );
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
	].forEach( function( prop ) {
		var stub = sinon.stub( view.$el, prop );
		view[prop]( 'test', 1 );
		ok( stub.calledWith( 'test', 1 ) );
		stub.restore();
	} );
} );

test( 'View.extend, with el property', function() {
	var ChildView, $testEl, view;
	ChildView = View.extend( {
		firstHeading: function() {
			return this.$( 'h1' ).text();
		}
	} );
	$testEl = $( '<div id="testView"><h1>Test</h1></div>' ).appendTo( 'body' );

	view = new ChildView( { el: '#testView' } );
	strictEqual( view.firstHeading(), 'Test', 'register additional functions' );
	$testEl.remove();
} );

test( 'View.extend, with defined template', function() {
	var ChildView, view;
	ChildView = View.extend( {
		className: 'my-class',
		template: '<h1>{{title}}</h1><p>{{content}}</p>',
		title: function() {
			return this.$( 'h1' ).text();
		},
		content: function() {
			return this.$( 'p' ).text();
		}
	} );

	view = new ChildView( { title: 'Test', content: 'Some content' } );
	strictEqual( view.$el[0].tagName.toUpperCase(), 'DIV', 'wrap template in <div>' );
	strictEqual( view.$el.attr( 'class' ), 'my-class', 'set class for $el' );
	strictEqual( view.title(), 'Test', 'fill template with data from options' );
	strictEqual( view.content(), 'Some content', 'fill template with data from options' );
} );

QUnit.test( 'View#preRender', 1, function() {
	var ChildView, view;
	ChildView = View.extend( {
		template: '<p>{{something}}</p>',
		preRender: function( options ) {
			options.something = 'hello';
		}
	} );

	view = new ChildView();
	strictEqual( view.$el.html(), '<p>hello</p>', 'manipulate template data' );
} );

QUnit.test( 'View#initialize', 1, function() {
	var ChildView, view, spy = sinon.spy();
	ChildView = View.extend( {
		initialize: function() {
			spy();
		}
	} );

	view = new ChildView();
	ok( spy.calledOnce, 'invoke initialize' );
} );

}( mw.mobileFrontend, jQuery ) );
