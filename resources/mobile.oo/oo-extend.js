( function () {
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
			OO.initClass( Child );
			prototype = ParentOrPrototype;
		}
		for ( key in prototype ) {
			Child.prototype[key] = prototype[key];
		}
	};

}() );
