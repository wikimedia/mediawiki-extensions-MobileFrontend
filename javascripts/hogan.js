// Register the Hogan compiler with MediaWiki.
( function () {
	/*
	 * Hogan template compiler
	 */
	var hogan = {
		/**
		 * Compiler source code into a template object
		 *
		 * @method
		 * @ignore
		 * @param {String} src the source of a template
		 * @return {Hogan.Template} template object
		 */
		compile: function ( src ) {
			return Hogan.compile( src );
		}
	};
	// register hogan compiler with core
	mw.template.registerCompiler( 'hogan', hogan );
}() );
