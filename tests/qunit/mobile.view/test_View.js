( function ( M, $ ) {

	var View = M.require( 'View' );

	QUnit.module( 'MobileFrontend view', {
		setup: function () {
			var compiler = {
				compile: function () {
					return {
						render: function ( data, partials ) {
							if ( partials && partials.content ) {
								return '<h1>' + data.title + '</h1><p>' + partials.content.render( data ) + '</p>';
							} else if ( data.content ) {
								return '<h1>' + data.title + '</h1><p>' + data.content + '</p>';
							} else {
								return '<p>' + data.text + '</p>';
							}
						}
					};
				}
			};
			// Register template compiler
			mw.template.registerCompiler( 'xyz', compiler );
		}
	} );

	QUnit.test( 'View', 2, function ( assert ) {
		var view = new View( {
			el: 'body'
		} );
		assert.ok( view.$el instanceof $, 'assign jQuery object to $el' );
		assert.strictEqual( view.$el[ 0 ].tagName.toUpperCase(), 'BODY', 'assign proper jQuery object to $el' );
	} );

	QUnit.test( 'View, jQuery proxy functions', 10, function ( assert ) {
		var self = this,
			view = new View( {
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
				var stub = self.sandbox.stub( view.$el, prop );
				view[ prop ]( 'test', 1 );
				assert.ok( stub.calledWith( 'test', 1 ) );
				stub.restore();
			} );
	} );

	QUnit.test( 'View.extend, with el property', 1, function ( assert ) {
		var ChildView, $testEl, view;
		ChildView = View.extend( {
			firstHeading: function () {
				return this.$( 'h1' ).text();
			}
		} );
		$testEl = $( '<div id="testView"><h1>Test</h1></div>' ).appendTo( 'body' );

		view = new ChildView( {
			el: '#testView'
		} );
		assert.strictEqual( view.firstHeading(), 'Test', 'register additional functions' );
		$testEl.remove();
	} );

	QUnit.test( 'View.extend, with defined template', 4, function ( assert ) {
		var ChildView, view;
		ChildView = View.extend( {
			className: 'my-class',
			template: mw.template.compile( '<h1>{{title}}</h1><p>{{content}}</p>', 'xyz' ),
			title: function () {
				return this.$( 'h1' ).text();
			},
			content: function () {
				return this.$( 'p' ).text();
			}
		} );

		view = new ChildView( {
			title: 'Test',
			content: 'Some content'
		} );
		assert.strictEqual( view.$el[ 0 ].tagName.toUpperCase(), 'DIV', 'wrap template in <div>' );
		assert.strictEqual( view.$el.hasClass( 'my-class' ), true, 'set class for $el' );
		assert.strictEqual( view.title(), 'Test', 'fill template with data from options' );
		assert.strictEqual( view.content(), 'Some content', 'fill template with data from options' );
	} );

	QUnit.test( 'View.extend, with partials', 2, function ( assert ) {
		var ParentView, ChildView, view;

		ParentView = View.extend( {
			template: mw.template.compile( '<h1>{{title}}</h1>{{>content}}', 'xyz' )
		} );

		ChildView = ParentView.extend( {
			templatePartials: {
				content: mw.template.compile( '<p>{{text}}</p>', 'xyz' )
			}
		} );

		view = new ChildView( {
			title: 'Test',
			text: 'Some content'
		} );
		assert.strictEqual( view.$( 'h1' ).text(), 'Test', 'fill template with data from options' );
		assert.strictEqual( view.$( 'p' ).text(), 'Some content', 'fill partial with data from options' );
	} );

	QUnit.test( 'View.extend, extending partials', 1, function ( assert ) {
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
		assert.deepEqual( view.templatePartials, {
			a: 1,
			b: 3,
			c: 4
		} );
	} );

	QUnit.test( 'View.extend, extending defaults', 1, function ( assert ) {
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

		view = new ChildView( {
			c: 5
		} );
		assert.deepEqual( view.options, {
			a: 1,
			b: 3,
			c: 5
		} );
	} );

	QUnit.test( 'View#preRender', 1, function ( assert ) {
		var ChildView, view;
		ChildView = View.extend( {
			template: mw.template.compile( '<p>{{text}}</p>', 'xyz' ),
			preRender: function ( options ) {
				options.text = 'hello';
			}
		} );

		view = new ChildView();
		assert.strictEqual( view.$el.html(), '<p>hello</p>', 'manipulate template data' );
	} );

	QUnit.test( 'View#postRender', 1, function ( assert ) {
		var ChildView, view, spy = this.sandbox.spy();
		ChildView = View.extend( {
			postRender: function () {
				spy();
			}
		} );

		view = new ChildView();
		assert.ok( spy.calledOnce, 'invoke postRender' );
	} );

	QUnit.test( 'View#delegateEvents', 3, function ( assert ) {

		var view, EventsView = View.extend( {
			template: mw.template.compile( '<p><span>test</span></p>', 'xyz' ),
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

}( mw.mobileFrontend, jQuery ) );
