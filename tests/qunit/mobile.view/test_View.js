( function ( M, $ ) {

	var View = M.require( 'mobile.view/View' );

	QUnit.module( 'MobileFrontend mobile.view/View', {
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

	QUnit.test( 'View extended, with el property', 1, function ( assert ) {
		var $testEl, view;
		function ChildView() {
			View.apply( this, arguments );
		}

		OO.mfExtend( ChildView, View, {
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

	QUnit.test( 'View extended, with defined template', 4, function ( assert ) {
		var view;
		function ChildView() {
			View.apply( this, arguments );
		}

		OO.mfExtend( ChildView, View, {
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

	QUnit.test( 'View extended, with partials', 2, function ( assert ) {
		var view;

		function ParentView() {
			View.apply( this, arguments );
		}

		OO.mfExtend( ParentView, View, {
			template: mw.template.compile( '<h1>{{title}}</h1>{{>content}}', 'xyz' )
		} );

		function ChildView() {
			ParentView.apply( this, arguments );
		}

		OO.mfExtend( ChildView, ParentView, {
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

	QUnit.test( 'View extended, extending partials', 1, function ( assert ) {
		var view;

		function ParentView() {
			View.apply( this, arguments );
		}

		OO.mfExtend( ParentView, View, {
			templatePartials: {
				a: 1,
				b: 2
			}
		} );

		function ChildView() {
			ParentView.apply( this, arguments );
		}

		OO.mfExtend( ChildView, ParentView, {
			templatePartials: $.extend( ParentView.prototype.templatePartials, {
				b: 3,
				c: 4
			} )
		} );

		view = new ChildView();
		assert.deepEqual( view.templatePartials, {
			a: 1,
			b: 3,
			c: 4
		} );
	} );

	QUnit.test( 'View extended, extending defaults', 1, function ( assert ) {
		var view;

		function ParentView() {
			View.apply( this, arguments );
		}

		OO.mfExtend( ParentView, View, {
			defaults: {
				a: 1,
				b: 2
			}
		} );

		function ChildView() {
			ParentView.apply( this, arguments );
		}

		OO.mfExtend( ChildView, ParentView, {
			defaults: $.extend( ParentView.prototype.defaults, {
				b: 3,
				c: 4
			} )
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
		var view;
		function ChildView() {
			View.apply( this, arguments );
		}

		OO.mfExtend( ChildView, View, {
			template: mw.template.compile( '<p>{{text}}</p>', 'xyz' ),
			preRender: function () {
				this.options.text = 'hello';
			}
		} );

		view = new ChildView();
		assert.strictEqual( view.$el.html(), '<p>hello</p>', 'manipulate template data' );
	} );

	QUnit.test( 'View#postRender', 1, function ( assert ) {
		var view, spy = this.sandbox.spy();
		function ChildView() {
			View.apply( this, arguments );
		}

		OO.mfExtend( ChildView, View, {
			postRender: function () {
				spy();
			}
		} );

		view = new ChildView();
		assert.ok( spy.calledOnce, 'invoke postRender' );
	} );

	QUnit.test( 'View#delegateEvents', 3, function ( assert ) {

		var view;
		function EventsView() {
			View.apply( this, arguments );
		}

		OO.mfExtend( EventsView, View, {
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

	QUnit.test( 'View#render (with isTemplateMode)', 2, function ( assert ) {
		var view, view2;
		function TemplateModeView() {
			View.apply( this, arguments );
		}

		OO.mfExtend( TemplateModeView, View, {
			template: mw.template.compile( '<p class="foo"><span>test</span></p>', 'html' ),
			isTemplateMode: true
		} );

		function ContainerView() {
			View.apply( this, arguments );
		}

		OO.mfExtend( ContainerView, View, {
			className: 'bar',
			template: mw.template.compile( '<p class="foo"><span>test</span></p>', 'html' )
		} );

		view = new TemplateModeView();
		view2 = new ContainerView();
		view.render();
		view2.render();
		assert.ok( view.$el.hasClass( 'foo' ) );
		assert.ok( view2.$el.hasClass( 'bar' ) );
	} );

	QUnit.test( 'View#render events (with isTemplateMode)', 4, function ( assert ) {
		var view;
		function TemplateModeView() {
			View.apply( this, arguments );
		}

		OO.mfExtend( TemplateModeView, View, {
			events: {
				'click span': 'onClick'
			},
			onClick: function () {
				this.$el.empty().text( 'hello world' );
			},
			template: mw.template.compile( '<p class="foo"><span>test</span></p>', 'html' ),
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

}( mw.mobileFrontend, jQuery ) );
