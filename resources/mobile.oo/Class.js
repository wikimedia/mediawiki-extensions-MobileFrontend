( function ( M ) {
	/**
	 * Extends a class with new methods and member properties.
	 *
	 * @param {Function} Child function
	 * @param {Object|Function} ParentOrPrototype class to inherit from OR if no inheriting class a prototype to
	 *  extend the class with,
	 * @param {Object} prototype
	 * @member OO
	 */
	OO.mfExtend = function ( Child, ParentOrPrototype, prototype ) {
		var key;
		if ( prototype ) {
			OO.inheritClass( Child, ParentOrPrototype );
		} else {
			OO.initClass( Class );
			prototype = ParentOrPrototype;
		}
		for ( key in prototype ) {
			Child.prototype[key] = prototype[key];
		}
	};

	/**
	 * Extends a class with new methods and member properties.
	 *
	 * @member Class
	 * @param {Object} prototype Prototype that should be incorporated into the new Class.
	 * @method
	 * @return {Class}
	 */
	function extend( prototype ) {
		var Parent = this;

		/**
		 * @ignore
		 */
		function Child() {
			return Parent.apply( this, arguments );
		}
		OO.mfExtend( Child, Parent, prototype );
		Child.extend = extend;
		return Child;
	}

	/**
	 * An extensible program-code-template for creating objects
	 *
	 * @class Class
	 */
	function Class() {
		OO.EventEmitter.call( this );
		this.initialize.apply( this, arguments );
	}
	OO.mixinClass( Class, OO.EventEmitter );

	/**
	 * Constructor, if you override it, use _super().
	 * @method
	 */
	Class.prototype.initialize = function () {};
	Class.extend = extend;
	mw.log.deprecate( Class, 'extend', extend,
		'Class is deprecated. Do not use this. Use OO.mfExtend' );

	M.define( 'mobile.oo/Class', Class );
	M.deprecate( 'Class', Class,
		'OO.initClass, OO.inheritClass or OO.extendClass to create a class' );

}( mw.mobileFrontend ) );
