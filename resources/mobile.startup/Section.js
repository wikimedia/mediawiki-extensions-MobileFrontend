( function ( M ) {

	var View = M.require( 'mobile.startup/View' ),
		icons = M.require( 'mobile.startup/icons' );

	/**
	 * Builds a section of a page
	 * @class Section
	 * @extends View
	 *
	 * @constructor
	 * @param {Object} options Configuration options
	 */
	function Section( options ) {
		var self = this;
		options.tag = 'h' + options.level;
		this.line = options.line;
		this.text = options.text;
		this.hasReferences = options.hasReferences || false;
		this.id = options.id || null;
		this.anchor = options.anchor;
		this.children = [];
		( options.children || [] ).forEach( function ( section ) {
			self.children.push( new Section( section ) );
		} );
		View.call( this, options );
	}

	OO.mfExtend( Section, View, {
		template: mw.template.get( 'mobile.startup', 'Section.hogan' ),
		/**
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {string} defaults.text Section text.
		 * @cfg {string} defaults.spinner HTML of the spinner icon.
		 */
		defaults: {
			line: undefined,
			text: '',
			spinner: icons.spinner().toHtmlString()
		}
	} );
	M.define( 'mobile.startup/Section', Section );

}( mw.mobileFrontend ) );
