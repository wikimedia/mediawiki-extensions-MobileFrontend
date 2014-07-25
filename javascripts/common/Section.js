( function( M, $ ) {

	var
		View = M.require( 'View' ),
		Section;

	/**
	 * @class Section
	 * @extends View
	 */
	Section = View.extend( {
		template: M.template.get( 'section' ),
		defaults: {
			line: '',
			text: '',
			editLabel: mw.msg( 'mobile-frontend-editor-edit' )
		},
		initialize: function( options ) {
			var self = this;
			options.tag = 'h' + options.level;
			this.line = options.line;
			this.text = options.text;
			this.hasReferences = options.hasReferences || false;
			this.id = options.id || null;
			this.anchor = options.anchor;
			this.children = [];
			$.each( options.children || [], function() {
				self.children.push( new Section( this ) );
			} );
			this._super( options );
		}
	} );
	M.define( 'Section', Section );

}( mw.mobileFrontend, jQuery ) );
