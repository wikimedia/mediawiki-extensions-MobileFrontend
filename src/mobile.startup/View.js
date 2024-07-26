/* global $ */
const util = require( './util' ),
	mfExtend = require( './mfExtend' ),
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
 *     require( './mfExtend' )( Section, View, {
 *       template: mw.template.compile( "&lt;h2&gt;{{title}}&lt;/h2&gt;" ),
 *     } );
 *     section = new Section( { title: 'Test', text: 'Test section body' } );
 *     section.appendTo( 'body' );
 * ```
 *
 * @class module:mobile.startup/View
 * @memberof module:mobile.startup/View
 * @classdesc Describes a component for rendering.
 * @mixes OO.EventEmitter
 */

function View() {
	this.initialize.apply( this, arguments );
}
OO.mixinClass( View, OO.EventEmitter );
mfExtend( View, {
	/**
	 * Name of tag that contains the rendered template
	 *
	 * @memberof module:mobile.startup/View
	 * @instance
	 * @property {string} tagName
	 */
	tagName: 'div',
	/**
	 * Tells the View to ignore tagName and className when constructing the element
	 * and to rely solely on the template
	 *
	 * @memberof module:mobile.startup/View
	 * @instance
	 * @property {boolean} isTemplateMode
	 */
	isTemplateMode: false,
	/**
	 * @memberof module:mobile.startup/View
	 * @instance
	 * @property {any}
	 * Specifies the template used in render(). Object|string
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
	 *     oo.mfExtend( SomeView, View, {
	 *       template: util.template( '<source-code>' ),
	 *       templatePartials: { content: util.template( '<source-code>' ) }
	 *     }
	 *
	 * @memberof module:mobile.startup/View
	 * @instance
	 * @property {Object}
	 */
	templatePartials: {},

	/**
	 * A set of default options that are merged with options passed into the initialize
	 * function.
	 *
	 * @memberof module:mobile.startup/View
	 * @instance
	 * @property {Object} defaults Default options hash.
	 * @property {jQuery.Object|string} [defaults.el] jQuery selector to use for rendering.
	 * @property {boolean} [defaults.skipTemplateRender] Whether to enhance views already in
	 * DOM. When enabled, the template is disabled so that it is not rendered in the DOM.
	 * Use in conjunction with View::defaults.$el to associate the View with an existing
	 * already rendered element in the DOM.
	 */
	defaults: {},

	/**
	 * Run once during construction to set up the View
	 *
	 * @memberof module:mobile.startup/View
	 * @instance
	 * @param {Object} options Object passed to the constructor.
	 * @param {Object.<string, string>} [options.events]
	 */
	initialize( options ) {
		const self = this;

		OO.EventEmitter.call( this );
		options = util.extend( {}, this.defaults, options );
		this.options = options;
		// Assign a unique id for dom events binding/unbinding
		this.cid = uniqueId( 'view' );

		// TODO: if template compilation is too slow, don't compile them on a
		// per object basis, but don't worry about it now (maybe add cache to
		// M.template.compile())
		if ( typeof this.template === 'string' ) {
			this.template = mw.template.compile( this.template );
		}

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
				self.$el = $( options.el );
				self._postInitialize( options );
			} );
		}
	},

	/**
	 * Called when this.$el is ready.
	 *
	 * @memberof module:mobile.startup/View
	 * @instance
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
	},

	/**
	 * Function called before the view is rendered. Can be redefined in
	 * objects that extend View.
	 *
	 * @memberof module:mobile.startup/View
	 * @instance
	 */
	preRender() {
	},

	/**
	 * Function called after the view is rendered. Can be redefined in
	 * objects that extend View.
	 *
	 * @memberof module:mobile.startup/View
	 * @instance
	 */
	postRender() {
	},

	/**
	 * Fill this.$el with template rendered using data if template is set.
	 *
	 * @memberof module:mobile.startup/View
	 * @instance
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
	},

	/**
	 * Set callbacks, where `this.options.events` is a hash of
	 *
	 * { 'event selector': 'callback' }
	 *
	 * {
	 *   'mousedown .title': 'edit',
	 *   'click .button': 'save',
	 *   'click .open': function(e) { ... }
	 * }
	 *
	 * pairs. Callbacks will be bound to the view, with `this` set properly.
	 * Uses event delegation for efficiency.
	 * Omitting the selector binds the event to `this.el`.
	 *
	 * @memberof module:mobile.startup/View
	 * @instance
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
	},

	/**
	 * Add a single event listener to the view's element (or a child element
	 * using `selector`). This only works for delegate-able events: not `focus`
	 * or `blur`.
	 *
	 * @memberof module:mobile.startup/View
	 * @instance
	 * @param {string} eventName
	 * @param {string} selector
	 * @param {Function} listener
	 */
	delegate( eventName, selector, listener ) {
		this.$el.on( eventName + '.delegateEvents' + this.cid, selector,
			listener );
	},

	/**
	 * Clears all callbacks previously bound to the view by `delegateEvents`.
	 * You usually don't need to use this, but may wish to if you have multiple
	 * views attached to the same DOM element.
	 *
	 * @memberof module:mobile.startup/View
	 * @instance
	 */
	undelegateEvents() {
		if ( this.$el ) {
			this.$el.off( '.delegateEvents' + this.cid );
		}
	},

	/**
	 * A finer-grained `undelegateEvents` for removing a single delegated event.
	 * `selector` and `listener` are both optional.
	 *
	 * @memberof module:mobile.startup/View
	 * @instance
	 * @param {string} eventName
	 * @param {string} selector
	 * @param {Function} listener
	 */
	undelegate( eventName, selector, listener ) {
		this.$el.off( eventName + '.delegateEvents' + this.cid, selector,
			listener );
	},

	/**
	 * See parseHTML method of util singleton
	 *
	 * @memberof module:mobile.startup/View
	 * @instance
	 * @param {string} html to turn into a jQuery object.
	 * @return {jQuery.Object}
	 */
	parseHTML( html ) {
		// document is explicitly passed due to a bug we found in Safari 11.1.2 where failure
		// to use document resulted in an element without access to the documentElement
		// this should be redundant, but no problem in being explicit (T214451).
		return util.parseHTML( html, document );
	}
} );

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

/**
 * Generates a view with children
 *
 * @param {Object} options
 * @param {jQuery.Element[]} children
 * @return {module:mobile.startup/View}
 */
View.make = function ( options = {}, children = [] ) {
	const view = new View( options );
	children.forEach( ( $child ) => view.append( $child ) );
	return view;
};

module.exports = View;
