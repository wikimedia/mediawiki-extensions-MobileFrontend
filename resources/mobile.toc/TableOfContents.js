( function ( M ) {
	var View = M.require( 'mobile.view/View' ),
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
		templatePartials: {
			tocHeading: mw.template.get( 'mobile.toc', 'heading.hogan' )
		},
		/**
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {String} defaults.tocIcon HTML of the Table of Contents icon.
		 * @cfg {String} defaults.contentsMsg TOC contents message.
		 */
		defaults: {
			tocIcon: new Icon( {
				name: 'toc',
				additionalClassNames: 'toc-button'
			} ).toHtmlString(),
			contentsMsg: mw.msg( 'toc' )
		},
		tagName: 'div',
		className: 'toc-mobile',
		template: mw.template.get( 'mobile.toc', 'toc.hogan' )
	} );

	M.define( 'mobile.toc/TableOfContents', TableOfContents );
}( mw.mobileFrontend ) );
