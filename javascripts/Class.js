/**
 * @class Class
 */
( function ( M ) {

	/**
	 * Extends a class with new methods and member properties.
	 *
	 * @param {Object} prototype Prototype that should be incorporated into the new Class.
	 * @method
	 * @return {Class}
	 */
	function extend( prototype ) {
		var key,
			Parent = this;

		/**
		 * @ignore
		 */
		function Child() {
			return Parent.apply( this, arguments );
		}
		OO.inheritClass( Child, Parent );
		for ( key in prototype ) {
			Child.prototype[key] = prototype[key];
		}
		Child.extend = extend;
		// FIXME: Use OOJS super here instead.
		Child.prototype._parent = Parent.prototype;
		return Child;
	}

	/**
	 * An extensible program-code-template for creating objects
	 *
	 * @class Class
	 */
	function Class() {
		this.initialize.apply( this, arguments );
	}
	/**
	 * Constructor, if you override it, use _super().
	 * @method
	 */
	Class.prototype.initialize = function () {};
	Class.extend = extend;

	M.define( 'Class', Class );

}( mw.mobileFrontend ) );
