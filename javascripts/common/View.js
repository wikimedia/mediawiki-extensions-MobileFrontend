( function( M, $ ) {

	var EventEmitter = M.require( 'eventemitter' ), View;

	/**
	 * Should be extended using extend().
	 *
	 * When options contains el property, this.$el in the constructed object
	 * will be set to the corresponding jQuery object. Otherwise, this.$el
	 * will be an empty <div>.
	 *
	 * When extended using extend(), if the extended prototype contains
	 * template property, this.$el will be filled with rendered template (with
	 * options parameter used as template data).
	 *
	 * template property can be a string which will be passed to M.template.compile()
	 * or an object that has a render() function which accepts an object with
	 * template data as its argument (similarly to an object created by
	 * M.template.compile()).
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
	 * @class
	 * @name View
	 * @example
	 * // var View, Section, section;
	 * //
	 * // View = M.require( 'View' );
	 * // Section = View.extend( {
	 * //    template: M.template.compile( '<h2>{{title}}</h2><p>{{text}}</p>' ),
	 * //     // ...
	 * // } );
	 * //
	 * // section = new Section( { title: 'Test', text: 'Test section body' } );
	 * // section.appendTo( 'body' );
	 *
	 * @constructor
	 * @extends EventEmitter
	 * @param {Object} options Options for the view, containing the el or
	 * template data or any other information you want to use in the view.
	 */
	View = EventEmitter.extend( {
		/**
		 * @name View.prototype.tagName
		 * @type String
		 */
		tagName: 'div',

		/**
		 * Specifies the template used in render().
		 *
		 * @name View.prototype.template
		 * @type {Object|string|HoganTemplate}
		 */

		/**
		 * Specifies partials (sub-templates) for the main template. Example:
		 *
		 * @example
		 * // example content for the "some" template (sub-template will be
		 * // inserted where {{>content}} is):
		 * // <h1>Heading</h1>
		 * // {{>content}}
		 *
		 * var SomeView = View.extend( {
		 *   template: M.template.get( 'some' ),
		 *   templatePartials: { content: M.template.get( 'sub' ) }
		 * }
		 *
		 * @name View.prototype.templatePartials
		 * @type {Object|string|HoganTemplate}
		 */

		/**
		 * A set of default options that are merged with options passed into the initialize function.
		 *
		 * @name View.prototype.defaults
		 * @type {Object}
		 */

		/**
		 * Constructor, if you override it, use _super().
		 *
		 * @name View.prototype.initialize
		 * @function
		 * @param {Object} options Object passed to the constructor.
		 */
		initialize: function( options ) {
			this._super();
			this.defaults = $.extend( {}, this._parent.defaults, this.defaults );
			this.templatePartials = $.extend( {}, this._parent.templatePartials, this.templatePartials );
			options = $.extend( {}, this.defaults, options );
			if ( options.el ) {
				this.$el = $( options.el );
			} else {
				this.$el = $( '<' + this.tagName + '>' );
			}
			this.$el.addClass( this.className );

			// TODO: if template compilation is too slow, don't compile them on a
			// per object basis, but don't worry about it now (maybe add cache to
			// M.template.compile())
			if ( typeof this.template === 'string' ) {
				this.template = M.template.compile( this.template );
			}

			this.options = options;
			this.render( options );
		},

		/**
		 * Function called before the view is rendered. Can be redefined in
		 * objects that extend View.
		 *
		 * @name View.prototype.preRender
		 * @function
		 * @param {Object} options Object passed to the constructor.
		 */
		preRender: function() {},

		/**
		 * Function called after the view is rendered. Can be redefined in
		 * objects that extend View.
		 *
		 * @name View.prototype.postRender
		 * @function
		 * @param {Object} options Object passed to the constructor.
		 */
		postRender: function() {},

		/**
		 * Fill this.$el with template rendered using data if template is set.
		 *
		 * @name View.prototype.render
		 * @function
		 * @param {Object} data Template data.
		 */
		render: function( data ) {
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
		 * @name View.prototype.$
		 * @function
		 * @param {string} query A jQuery CSS selector.
		 * @return {jQuery} jQuery object containing results of the search.
		 */
		$: function( query ) {
			return this.$el.find( query );
		}
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
	].forEach( function( prop ) {
		View.prototype[prop] = function() {
			this.$el[prop].apply( this.$el, arguments );
			return this;
		};
	} );

	M.define( 'View', View );

}( mw.mobileFrontend, jQuery ) );
