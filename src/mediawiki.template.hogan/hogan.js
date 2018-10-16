var Hogan = require( 'hogan.js' );

/**
 * Hogan template compiler
 * @class hogan
 */
module.exports = {
	/**
	 * Compiler source code into a template object
	 *
	 * @memberof hogan
	 * @instance
	 * @param {string} src the source of a template
	 * @return {Hogan.Template} template object
	 */
	compile: function ( src ) {
		return Hogan.compile( src );
	}
};
