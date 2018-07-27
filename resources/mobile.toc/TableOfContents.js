( function ( M ) {
	var View = M.require( 'mobile.startup/View' ),
		Icon = M.require( 'mobile.startup/Icon' );

	/**
	 * View for table of contents
	 * @class TableOfContents
	 * @extends View
	 * @uses Icon
	 */
	function TableOfContents() {
		View.apply( this, arguments );
	}

	OO.mfExtend( TableOfContents, View, {
		/**
		 * @memberof TableOfContents
		 * @instance
		 */
		templatePartials: {
			tocHeading: mw.template.get( 'mobile.toc', 'heading.hogan' )
		},
		/**
		 * @memberof TableOfContents
		 * @instance
		 * @mixes View#defaults
		 * @property {Object} defaults Default options hash.
		 * @property {string} defaults.tocIcon HTML of the Table of Contents icon.
		 * @property {string} defaults.contentsMsg TOC contents message.
		 */
		defaults: {
			tocIcon: new Icon( {
				name: 'toc',
				additionalClassNames: 'toc-button'
			} ).toHtmlString(),
			contentsMsg: mw.msg( 'toc' )
		},
		/**
		 * @memberof TableOfContents
		 * @instance
		 */
		tagName: 'div',
		/**
		 * @memberof TableOfContents
		 * @instance
		 */
		className: 'toc-mobile',
		/**
		 * @memberof TableOfContents
		 * @instance
		 */
		template: mw.template.get( 'mobile.toc', 'toc.hogan' )
	} );

	M.define( 'mobile.toc/TableOfContents', TableOfContents ); // resource-modules-disable-line
}( mw.mobileFrontend ) );
