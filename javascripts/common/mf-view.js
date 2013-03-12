( function( M, $ ) {

	var oop = M.require( 'oop' ),
		EventEmitter = M.require( 'eventemitter' );

	/**
	 * An abstraction over a jQuery element. Should be extended using extend().
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
	 * @example
	 * <code>
	 * var View, Section, section;
	 *
	 * View = M.require( 'view' );
	 * Section = View.extend( {
	 *     template: M.template.compile( '<h2>{{title}}</h2><p>{{text}}</p>' ),
	 *     // ...
	 * } );
	 *
	 * section = new Section( { title: 'Test', text: 'Test section body' } );
	 * section.appendTo( 'body' );
	 * </code>
	 *
	 * @constructor
	 * @param {Object} options Options for the view, containing the el or
	 * template data or any other information you want to use in the view.
	 */
	function View( options ) {
		options = $.extend( {}, this.defaults, options );
		if ( options.el ) {
			this.$el = $( options.el );
		} else {
			this.$el = $( '<div>' );
		}
		this.$el.addClass( this.className );

		// TODO: if template compilation is too slow, don't compile them on a
		// per object basis, but don't worry about it now (maybe add cache to
		// M.template.compile())
		if ( typeof this.template === 'string' ) {
			this.template = M.template.compile( this.template );
		}

		this.preRender( options );
		this.render( options );
		this.initialize( options );
	}

	View.prototype = new EventEmitter();

	/**
	 * Function called before the view is constructed. Can be redefined in
	 * objects that extend View.
	 *
	 * @param {Object} options Object passed to the constructor.
	 */
	View.prototype.preRender = function() {};

	/**
	 * Function called after the view is constructed. Can be redefined in
	 * objects that extend View.
	 *
	 * @param {Object} options Object passed to the constructor.
	 */
	View.prototype.initialize = function() {};

	/**
	 * Fill this.$el with template rendered using data if template is set.
	 *
	 * @param {Object} data Template data.
	 */
	View.prototype.render = function( data ) {
		if ( this.template ) {
			this.$el.html( this.template.render( data ) );
		}
	};

	/**
	 * Wraps this.$el.find, so that you can search for elements in the view's
	 * ($el's) scope.
	 *
	 * @param {string} query A jQuery CSS selector.
	 * @return {jQuery} jQuery object containing results of the search.
	 */
	View.prototype.$ = function( query ) {
		return this.$el.find( query );
	};

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

	View.extend = oop.extend;

	M.define( 'view', View );

}( mw.mobileFrontend, jQuery ) );
