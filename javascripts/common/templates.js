( function( $ ) {
var
	templates = {}, template;
	/**
	 * @namespace
	 * @name mw.template
	 */
	template = {
		/**
		 * Define template using html. Compiles newly added templates
		 * @name mw.template.add
		 * @function
		 * @param {String} name Name of template to add
		 * @param {String} markup Associated markup (html)
		 */
		add: function( name, markup ) {
			templates[ name ] = this.compile( markup );
		},
		/**
		 * Retrieve defined template
		 *
		 * @name mw.template.get
		 * @function
		 * @param {String} name Name of template to be retrieved
		 * @return {Hogan.Template}
		 * accepts template data object as its argument.
		 */
		get: function( name ) {
			if ( !templates[ name ] ) {
				throw new Error( 'Template not found: ' + name );
			}
			return templates[ name ];
		},
		/**
		 * Wraps our template engine of choice (currently Hogan).
		 *
		 * @name mw.template.compile
		 * @function
		 * @param {string} templateBody Template body.
		 * @return {Hogan.Template}
		 * accepts template data object as its argument.
		 */
		compile: function( templateBody ) {
			return Hogan.compile( templateBody );
		}
	};

	$.extend( mw, {
		template: template
	} );

}( jQuery ) );
