/* jshint loopfunc: true */
/**
 * @class Class
 */
( function( M ) {

	/**
	 * Extends a class with new methods and member properties.
	 *
	 * @param {Object} prototype
	 * @method
	 * @return {Class}
	 */
	function extend( prototype ) {
		var Parent = this, key;
		function Child() {
			return Parent.apply( this, arguments );
		}
		function Surrogate() {}
		Surrogate.prototype = Parent.prototype;
		Child.prototype = new Surrogate();
		Child.prototype._parent = Parent.prototype;

		// http://ejohn.org/blog/simple-javascript-inheritance
		// Copy the properties over onto the new prototype
		for ( key in prototype ) {
			// Check if we're overwriting an existing function
			if ( typeof prototype[key] === 'function' && typeof Parent.prototype[key] === 'function' ) {
				Child.prototype[key] = ( function( key, fn ) {
					return function() {
						var tmp = this._super, ret;

						// Add a new ._super() method that is the same method
						// but on the super-class
						this._super = Parent.prototype[key];

						// The method only need to be bound temporarily, so we
						// remove it when we're done executing
						ret = fn.apply(this, arguments);
						this._super = tmp;

						return ret;
					};
				} )( key, prototype[key] );
			} else {
				Child.prototype[key] = prototype[key];
			}
		}

		Child.extend = extend;
		return Child;
	}

	function Class() {
		this.initialize.apply( this, arguments );
	}
	/**
	 * Constructor, if you override it, use _super().
	 * @method
	 */
	Class.prototype.initialize = function() {};
	Class.extend = extend;

	M.define( 'Class', Class );

}( mw.mobileFrontend ) );
