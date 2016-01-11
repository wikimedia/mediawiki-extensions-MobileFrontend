( function ( M, $ ) {

	var View = M.require( 'mobile.view/View' ),
		icons = M.require( 'mobile.startup/icons' );

	/**
	 * Builds a section of a page
	 * @class Section
	 * @extends View
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
		$.each( options.children || [], function () {
			self.children.push( new Section( this ) );
		} );
		View.call( this, options );
	}

	OO.mfExtend( Section, View, {
		template: mw.template.get( 'mobile.startup', 'Section.hogan' ),
		/**
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {String} defaults.text Section text.
		 * @cfg {String} defaults.spinner HTML of the spinner icon.
		 */
		defaults: {
			line: undefined,
			text: '',
			spinner: icons.spinner().toHtmlString()
		}
	} );
	M.define( 'mobile.startup/Section', Section );

}( mw.mobileFrontend, jQuery ) );
