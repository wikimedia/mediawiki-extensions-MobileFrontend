( function( M, $ ) {

var View = M.require( 'View' );

QUnit.module( 'MobileFrontend view' );

QUnit.test( 'View', 2, function() {
	var view = new View( { el: 'body' } );
	ok( view.$el instanceof $, 'assign jQuery object to $el' );
	strictEqual( view.$el[0].tagName.toUpperCase(), 'BODY', 'assign proper jQuery object to $el' );
} );

QUnit.test( 'View, jQuery proxy functions', 10, function() {
	var self = this, view = new View( { el: 'body' } );
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
		var stub = self.sandbox.stub( view.$el, prop );
		view[prop]( 'test', 1 );
		ok( stub.calledWith( 'test', 1 ) );
		stub.restore();
	} );
} );

QUnit.test( 'View.extend, with el property', 1, function() {
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

QUnit.test( 'View.extend, with defined template', 4, function() {
	var ChildView, view;
	ChildView = View.extend( {
		className: 'my-class',
		template: M.template.compile( '<h1>{{title}}</h1><p>{{content}}</p>' ),
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

QUnit.test( 'View.extend, with partials', 2, function( assert ) {
	var ParentView, ChildView, view;

	ParentView = View.extend( {
		template: M.template.compile( '<h1>{{title}}</h1>{{>content}}' )
	} );

	ChildView = ParentView.extend( {
		templatePartials: {
			content: M.template.compile( '<p>{{text}}</p>' )
		}
	} );

	view = new ChildView( { title: 'Test', text: 'Some content' } );
	assert.strictEqual( view.$( 'h1' ).text(), 'Test', 'fill template with data from options' );
	assert.strictEqual( view.$( 'p' ).text(), 'Some content', 'fill partial with data from options' );
} );

QUnit.test( 'View.extend, extending partials', 1, function( assert ) {
	var ParentView, ChildView, view;

	ParentView = View.extend( {
		templatePartials: {
			a: 1,
			b: 2
		}
	} );

	ChildView = ParentView.extend( {
		templatePartials: {
			b: 3,
			c: 4
		}
	} );

	view = new ChildView();
	assert.deepEqual( view.templatePartials, { a: 1, b: 3, c: 4 } );
} );

QUnit.test( 'View.extend, extending defaults', 1, function( assert ) {
	var ParentView, ChildView, view;

	ParentView = View.extend( {
		defaults: {
			a: 1,
			b: 2
		}
	} );

	ChildView = ParentView.extend( {
		defaults: {
			b: 3,
			c: 4
		}
	} );

	view = new ChildView( { c: 5 } );
	assert.deepEqual( view.options, { a: 1, b: 3, c: 5 } );
} );

QUnit.test( 'View#preRender', 1, function() {
	var ChildView, view;
	ChildView = View.extend( {
		template: M.template.compile( '<p>{{something}}</p>' ),
		preRender: function( options ) {
			options.something = 'hello';
		}
	} );

	view = new ChildView();
	strictEqual( view.$el.html(), '<p>hello</p>', 'manipulate template data' );
} );

QUnit.test( 'View#postRender', 1, function() {
	var ChildView, view, spy = this.sandbox.spy();
	ChildView = View.extend( {
		postRender: function() {
			spy();
		}
	} );

	view = new ChildView();
	ok( spy.calledOnce, 'invoke postRender' );
} );

}( mw.mobileFrontend, jQuery) );
