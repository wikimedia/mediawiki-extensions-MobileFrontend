( function ( M, $ ) {

	var EventEmitter = M.require( 'eventemitter' ),
		View,
		// Cached regex to split keys for `delegate`.
		delegateEventSplitter = /^(\S+)\s*(.*)$/,
		idCounter = 0;

	/**
	 * Generate a unique integer id (unique within the entire client session).
	 * Useful for temporary DOM ids.
	 * @ignore
	 * @param {String} prefix Prefix to be used when generating the id.
	 * @returns {String}
	 */
	function uniqueId( prefix ) {
		var id = ( ++idCounter ).toString();
		return prefix ? prefix + id : id;
	}

	/**
	 * Should be extended using extend().
	 *
	 * When options contains el property, this.$el in the constructed object
	 * will be set to the corresponding jQuery object. Otherwise, this.$el
	 * will be an empty div.
	 *
	 * When extended using extend(), if the extended prototype contains
	 * template property, this.$el will be filled with rendered template (with
	 * options parameter used as template data).
	 *
	 * template property can be a string which will be passed to mw.template.compile()
	 * or an object that has a render() function which accepts an object with
	 * template data as its argument (similarly to an object created by
	 * mw.template.compile()).
	 *
	 * You can also define a defaults property which should be an object
	 * containing default values for the template (if they're not present in
	 * the options parameter).
	 *
	 * If this.$el is not a jQuery object bound to existing DOM element, the
	 * view can be attached to an element using appendTo(), prependTo(),
	 * insertBefore(), insertAfter() proxy functions.
	 *
	 * append(), prepend(), before(), after() can be used to modify $el. on()
	 * can be used to bind events.
	 *
	 * You can also use declarative DOM events binding by specifying an `events`
	 * map on the class. The keys will be 'event selector' and the value can be
	 * either the name of a method to call, or a function. All methods and
	 * functions will be executed on the context of the View.
	 *
	 * Inspired from Backbone.js
	 * https://github.com/jashkenas/backbone/blob/master/backbone.js#L1128
	 *
	 *     @example
	 *     <code>
	 *     var MyComponent = View.extend( {
	 *       events: {
	 *	       'mousedown .title': 'edit',
	 *	       'click .button': 'save',
	 *	       'click .open': function(e) { ... }
	 *       },
	 *       edit: function ( ev ) {
	 *         //...
	 *       },
	 *       save: function ( ev ) {
	 *         //...
	 *       }
	 *     } );
	 *     </code>
	 *
	 * @class View
	 * @extends EventEmitter
	 * @param {Object} options Options for the view, containing the el or
	 * template data or any other information you want to use in the view.
	 * Example:
	 *     @example
	 *     <pre>
	 *     var View, Section, section;
	 *     View = M.require( 'View' );
	 *     Section = View.extend( {
	 *       template: mw.template.compile( "&lt;h2&gt;{{title}}&lt;/h2&gt;" ),
	 *     } );
	 *     section = new Section( { title: 'Test', text: 'Test section body' } );
	 *     section.appendTo( 'body' );
	 *     </pre>
	 */
	View = EventEmitter.extend( {
		/**
		 * Name of tag that contains the rendered template
		 * @property String
		 */
		tagName: 'div',

		/**
		 * @property {Mixed}
		 * Specifies the template used in render(). Object|String|HoganTemplate
		 */
		template: undefined,

		/**
		 * Specifies partials (sub-templates) for the main template. Example:
		 *
		 *     @example
		 *     // example content for the "some" template (sub-template will be
		 *     // inserted where {{>content}} is):
		 *     // <h1>Heading</h1>
		 *     // {{>content}}
		 *
		 *     var SomeView = View.extend( {
		 *     template: M.template.get( 'some.hogan' ),
		 *     templatePartials: { content: M.template.get( 'sub.hogan' ) }
		 *     }
		 *
		 * @property {Object}
		 */
		templatePartials: {},

		/**
		 * A set of default options that are merged with options passed into the initialize function.
		 *
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {jQuery.Object|String} [defaults.el] jQuery selector to use for rendering.
		 */
		defaults: {},

		/**
		 * Default events map
		 */
		events: null,

		/**
		 * Run once during construction to set up the View
		 * @method
		 * @param {Object} options Object passed to the constructor.
		 */
		initialize: function ( options ) {
			EventEmitter.prototype.initialize.apply( this, arguments );
			this.defaults = $.extend( {}, this._parent.defaults, this.defaults );
			this.templatePartials = $.extend( {}, this._parent.templatePartials, this.templatePartials );
			options = $.extend( {}, this.defaults, options );
			if ( options.el ) {
				this.$el = $( options.el );
			} else {
				this.$el = $( '<' + this.tagName + '>' );
			}
			this.$el.addClass( this.className );
			// FIXME: If this becomes a default should become part of className property.
			this.$el.addClass( 'view-border-box' );

			// TODO: if template compilation is too slow, don't compile them on a
			// per object basis, but don't worry about it now (maybe add cache to
			// M.template.compile())
			if ( typeof this.template === 'string' ) {
				this.template = mw.template.compile( this.template );
			}

			this.options = options;
			this.render( options );

			// Assign a unique id for dom events binding/unbinding
			this.cid = uniqueId( 'view' );
			this.delegateEvents();
		},

		/**
		 * Function called before the view is rendered. Can be redefined in
		 * objects that extend View.
		 *
		 * @method
		 * @param {Object} options Object passed to the constructor.
		 */
		preRender: $.noop,

		/**
		 * Function called after the view is rendered. Can be redefined in
		 * objects that extend View.
		 *
		 * @method
		 * @param {Object} options Object passed to the constructor.
		 */
		postRender: $.noop,

		/**
		 * Fill this.$el with template rendered using data if template is set.
		 *
		 * @method
		 * @param {Object} data Template data.
		 */
		render: function ( data ) {
			data = $.extend( true, {}, this.options, data );
			this.preRender( data );
			if ( this.template ) {
				this.$el.html( this.template.render( data, this.templatePartials ) );
			}
			this.postRender( data );

			return this;
		},

		/**
		 * Wraps this.$el.find, so that you can search for elements in the view's
		 * ($el's) scope.
		 *
		 * @method
		 * @param {String} query A jQuery CSS selector.
		 * @return {jQuery.Object} jQuery object containing results of the search.
		 */
		$: function ( query ) {
			return this.$el.find( query );
		},

		/**
		 * Set callbacks, where `this.events` is a hash of
		 *
		 * {"event selector": "callback"}
		 *
		 * {
		 *	'mousedown .title': 'edit',
		 *	'click .button': 'save',
		 *	'click .open': function(e) { ... }
		 * }
		 *
		 * pairs. Callbacks will be bound to the view, with `this` set properly.
		 * Uses event delegation for efficiency.
		 * Omitting the selector binds the event to `this.el`.
		 *
		 * @param {Object} events Optionally set this events instead of the ones on this.
		 */
		delegateEvents: function ( events ) {
			var match, key, method;
			// Take either the events parameter or the this.events to process
			events = events || this.events;
			if ( events ) {
				// Remove current events before re-binding them
				this.undelegateEvents();
				for ( key in events ) {
					method = events[ key ];
					// If the method is a string name of this.method, get it
					if ( !$.isFunction( method ) ) {
						method = this[ events[ key ] ];
					}
					if ( method ) {
						// Extract event and selector from the key
						match = key.match( delegateEventSplitter );
						this.delegate( match[ 1 ], match[ 2 ], $.proxy( method, this ) );
					}
				}
			}
		},

		/**
		 * Add a single event listener to the view's element (or a child element
		 * using `selector`). This only works for delegate-able events: not `focus`,
		 * `blur`, and not `change`, `submit`, and `reset` in Internet Explorer.
		 *
		 * @param {String} eventName
		 * @param {String} selector
		 * @param {Function} listener
		 */
		delegate: function ( eventName, selector, listener ) {
			this.$el.on( eventName + '.delegateEvents' + this.cid, selector,
				listener );
		},

		/**
		 * Clears all callbacks previously bound to the view by `delegateEvents`.
		 * You usually don't need to use this, but may wish to if you have multiple
		 * views attached to the same DOM element.
		 */
		undelegateEvents: function () {
			if ( this.$el ) {
				this.$el.off( '.delegateEvents' + this.cid );
			}
		},

		/**
		 * A finer-grained `undelegateEvents` for removing a single delegated event.
		 * `selector` and `listener` are both optional.
		 *
		 * @param {String} eventName
		 * @param {String} selector
		 * @param {Function} listener
		 */
		undelegate: function ( eventName, selector, listener ) {
			this.$el.off( eventName + '.delegateEvents' + this.cid, selector,
				listener );
		}

	} );

	$.each( [
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
	], function ( i, prop ) {
		/** @ignore **/
		View.prototype[prop] = function () {
			this.$el[prop].apply( this.$el, arguments );
			return this;
		};
	} );

	M.define( 'View', View );

}( mw.mobileFrontend, jQuery ) );
