/* global $ */
const util = require( './util' ),
	// Cached regex to split keys for `delegate`.
	delegateEventSplitter = /^(\S+)\s*(.*)$/;

let idCounter = 0;

/**
 * Generate a unique integer id (unique within the entire client session).
 * Useful for temporary DOM ids.
 *
 * @private
 * @param {string} prefix Prefix to be used when generating the id.
 * @return {string}
 */
function uniqueId( prefix ) {
	const id = ( ++idCounter ).toString();
	return prefix ? prefix + id : id;
}

/**
 * Describes a component for rendering.
 *
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
 * Example:
 * ```js
 *     var
 *       MyComponent = View.extend( {
 *         edit: function ( ev ) {
 *           //...
 *         },
 *         save: function ( ev ) {
 *           //...
 *         }
 *       } ),
 *       instance = new MyComponent({
 *         events: {
 *           'mousedown .title': 'edit',
 *           'click .button': 'save',
 *           'click .open': function(e) { ... }
 *         }
 *       });
 * ```
 *
 * Example:
 * ```js
 *     var View, section;
 *     function Section( options ) {
 *       var defaultOptions = {
 *         events: {
 *           // ...
 *         }
 *       }
 *       View.call( this, util.extends( {}, defaultOptions, options ) );
 *     }
 *     View = require( './View' );
 *     class Section extends View {
 *       get template() {
 *         return mw.template.compile( "&lt;h2&gt;{{title}}&lt;/h2&gt;" ),
 *       }
 *     }
 *     section = new Section( { title: 'Test', text: 'Test section body' } );
 *     section.appendTo( 'body' );
 * ```
 *
 * @mixes OO.EventEmitter
 */
class View {
	/**
	 * @param {Object} options Object passed to the constructor.
	 * @param {Object.<string, string>} [options.events]
	 */
	constructor( options ) {
		this.initialize( options );
	}

	/**
	 * @property {Object}
	 * Specifies the template used in render().
	 */
	get template() {
		return undefined;
	}

	/**
	 * Specifies partials (sub-templates) for the main template. Example:
	 *
	 *     @example
	 *     // example content for the "some" template (sub-template will be
	 *     // inserted where {{>content}} is):
	 *     // <h1>Heading</h1>
	 *     // {{>content}}
	 *
	 *     class SomeView extends View {
	 *       get template() { return util.template( '<source-code>' ) }
	 *       get templatePartials() { return { content: util.template( '<source-code>' ) } }
	 *     }
	 *
	 * @property {Object}
	 */
	get templatePartials() {
		return {};
	}

	/**
	 * A set of default options that are merged with options passed into the initialize
	 * function.
	 *
	 * @property {Object} defaults Default options hash.
	 * @property {jQuery.Object|string} [defaults.el] jQuery selector to use for rendering.
	 * @property {boolean} [defaults.skipTemplateRender] Whether to enhance views already in
	 * DOM. When enabled, the template is disabled so that it is not rendered in the DOM.
	 * Use in conjunction with View::defaults.$el to associate the View with an existing
	 * already rendered element in the DOM.
	 */
	get defaults() {
		return {};
	}

	/**
	 * Name of tag that contains the rendered template
	 *
	 * @property {string} tagName
	 */
	get tagName() {
		return 'div';
	}

	/**
	 * Tells the View to ignore tagName and className when constructing the element
	 * and to rely solely on the template
	 *
	 * @property {boolean} isTemplateMode
	 */
	get isTemplateMode() {
		return false;
	}

	/**
	 * Run once during construction to set up the View
	 *
	 * @param {Object} options Object passed to the constructor.
	 * @param {Object.<string, string>} [options.events]
	 */
	initialize( options ) {
		OO.EventEmitter.call( this );
		options = util.extend( {}, this.defaults, options );
		this.options = options;
		// Assign a unique id for dom events binding/unbinding
		this.cid = uniqueId( 'view' );

		if ( options.el ) {
			// Note the element may not be in the document so must use global jQuery here
			this.$el = $( options.el );
		} else {
			this.$el = this.parseHTML( '<' + this.tagName + '>' );
		}

		// Make sure the element is ready to be manipulated
		if ( this.$el.length ) {
			this._postInitialize( options );
		} else {
			util.docReady( () => {
				// Note the element may not be in the document so must use global jQuery here
				this.$el = $( options.el );
				this._postInitialize( options );
			} );
		}
	}

	/**
	 * Called when this.$el is ready.
	 *
	 * @private
	 * @param {Object} props
	 */
	_postInitialize( props ) {
		// eslint-disable-next-line mediawiki/class-doc
		this.$el.addClass( props.className );
		// border-box will be added provided this flag is not set
		if ( props.isBorderBox !== false ) {
			this.$el.addClass( 'view-border-box' );
		}

		this.render( {} );
	}

	/**
	 * Function called before the view is rendered. Can be redefined in
	 * objects that extend View.
	 */
	preRender() {
	}

	/**
	 * Function called after the view is rendered. Can be redefined in
	 * objects that extend View.
	 */
	postRender() {
	}

	/**
	 * Fill this.$el with template rendered using data if template is set.
	 *
	 * @param {Object} data Template data. Will be merged into the view's
	 * options
	 * @chainable
	 */
	render( data ) {
		let $el, html;
		util.extend( this.options, data );
		this.preRender();
		this.undelegateEvents();
		if ( this.template && !this.options.skipTemplateRender ) {
			html = this.template.render( this.options, this.templatePartials );
			if ( this.isTemplateMode ) {
				$el = $( html );
				this.$el.replaceWith( $el );
				this.$el = $el;
			} else {
				this.$el.html( html );
			}
		}
		this.postRender();
		this.delegateEvents();
		return this;
	}

	/**
	 * Set callbacks for events.
	 *
	 * `this.options.events` is a hash of pairs:
	 *
	 * ```
	 * { 'event selector': 'callback' }
	 *
	 * {
	 *   'mousedown .title': 'edit',
	 *   'click .button': 'save',
	 *   'click .open': function(e) { ... }
	 * }
	 * ```
	 *
	 * Callbacks will be bound to the view, with `this` set properly.
	 * Uses event delegation for efficiency.
	 * Omitting the selector binds the event to `this.el`.
	 *
	 * @param {Object} events Optionally set this events instead of the ones on this.
	 */
	delegateEvents( events ) {
		let match, key, method;
		events = events || this.options.events;
		if ( events ) {
			// Remove current events before re-binding them
			this.undelegateEvents();
			for ( key in events ) {
				method = events[key];
				// If the method is a string name of this.method, get it
				if ( typeof method !== 'function' ) {
					method = this[events[key]];
				}
				if ( method ) {
					// Extract event and selector from the key
					match = key.match( delegateEventSplitter );
					this.delegate( match[1], match[2], method.bind( this ) );
				}
			}
		}
	}

	/**
	 * Add a single event listener to the view's element (or a child element
	 * using `selector`). This only works for delegate-able events: not `focus`
	 * or `blur`.
	 *
	 * @param {string} eventName
	 * @param {string} selector
	 * @param {Function} listener
	 */
	delegate( eventName, selector, listener ) {
		this.$el.on( eventName + '.delegateEvents' + this.cid, selector,
			listener );
	}

	/**
	 * Clears all callbacks previously bound to the view by `delegateEvents`.
	 * You usually don't need to use this, but may wish to if you have multiple
	 * views attached to the same DOM element.
	 */
	undelegateEvents() {
		if ( this.$el ) {
			this.$el.off( '.delegateEvents' + this.cid );
		}
	}

	/**
	 * A finer-grained `undelegateEvents` for removing a single delegated event.
	 * `selector` and `listener` are both optional.
	 *
	 * @param {string} eventName
	 * @param {string} selector
	 * @param {Function} listener
	 */
	undelegate( eventName, selector, listener ) {
		this.$el.off( eventName + '.delegateEvents' + this.cid, selector,
			listener );
	}

	/**
	 * See parseHTML method of util singleton
	 *
	 * @param {string} html to turn into a jQuery object.
	 * @return {jQuery.Object}
	 */
	parseHTML( html ) {
		// document is explicitly passed due to a bug we found in Safari 11.1.2 where failure
		// to use document resulted in an element without access to the documentElement
		// this should be redundant, but no problem in being explicit (T214451).
		return util.parseHTML( html, document );
	}

	/**
	 * Generates a view with children
	 *
	 * @param {Object} options
	 * @param {jQuery.Element[]} children
	 * @return {View}
	 */
	static make( options = {}, children = [] ) {
		const view = new View( options );
		children.forEach( ( $child ) => view.append( $child ) );
		return view;
	}
}

OO.mixinClass( View, OO.EventEmitter );

/**
 * @memberof View
 * @instance
 * @function append
 * @param {...(string|Node|Node[]|jQuery)} contents
 * @return {View}
 */

/**
 * @memberof View
 * @instance
 * @function append
 * @param {function(number, string): string|Node|Node[]|jQuery} contents
 * @return {View}
 */

/**
 * @memberof View
 * @instance
 * @function prepend
 * @param {...(string|Node|Node[]|jQuery)} contents
 * @return {View}
 */

/**
 * @memberof View
 * @instance
 * @function prepend
 * @param {function(number, string): string|Node|Node[]|jQuery} contents
 * @return {View}
 */

/**
 * @memberof View
 * @instance
 * @function appendTo
 * @param {string|Node|Node[]|jQuery} target
 * @return {View}
 */

/**
 * @memberof View
 * @instance
 * @function prependTo
 * @param {string|Node|Node[]|jQuery} target
 * @return {View}
 */

/**
 * @memberof View
 * @instance
 * @function after
 * @param {...(string|Node|Node[]|jQuery)} contents
 * @return {View}
 */

/**
 * @memberof View
 * @instance
 * @function after
 * @param {function(number, string): string|Node|Node[]|jQuery} contents
 * @return {View}
 */

/**
 * @memberof View
 * @instance
 * @functiontion before
 * @param {...(string|Node|Node[]|jQuery)} contents
 * @return {View}
 */

/**
 * @memberof View
 * @instance
 * @function before
 * @param {function(number, string): string|Node|Node[]|jQuery} contents
 * @return {View}
 */

/**
 * @memberof View
 * @instance
 * @property {jQuery.Object} $el
 */

/**
 * @memberof View
 * @instance
 * @function insertAfter
 * @param {string|Node|Node[]|jQuery} target
 * @return {View}
 */

/**
 * @memberof View
 * @instance
 * @function insertBefore
 * @param {string|Node|Node[]|jQuery} target
 * @return {View}
 */

/**
 * @memberof View
 * @instance
 * @function remove
 * @param {string} [selector]
 * @return {View}
 */

/**
 * @memberof View
 * @instance
 * @function detach
 * @param {string} [selector]
 * @return {View}
 */

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
	View.prototype[prop] = function () {
		this.$el[prop].apply( this.$el, arguments );
		return this;
	};
} );

module.exports = View;
