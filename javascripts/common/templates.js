/**
 * @singleton
 * @class mw.template
 */
( function( $ ) {
var
	templates = {}, template;
	template = {
		/**
		 * Define template using html. Compiles newly added templates
		 * @method
		 * @param {String} name Name of template to add
		 * @param {String} markup Associated markup (html)
		 */
		add: function( name, markup ) {
			templates[ name ] = this.compile( markup );
		},
		/**
		 * Retrieve defined template
		 *
		 * @method
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
		 * @method
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
