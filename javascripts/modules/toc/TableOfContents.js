( function ( M ) {
	var TableOfContents,
		MobileWebClickTracking = M.require( 'loggingSchemas/MobileWebClickTracking' ),
		View = M.require( 'View' ),
		Icon = M.require( 'Icon' );

	/**
	 * View for table of contents
	 * @class TableOfContents
	 * @extends View
	 * @uses Icon
	 * @uses MobileWebClickTracking
	 */
	TableOfContents = View.extend( {
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
		template: mw.template.get( 'mobile.toc', 'toc.hogan' ),
		/** @inheritdoc */
		postRender: function () {
			var log = MobileWebClickTracking.log;
			View.prototype.postRender.apply( this, arguments );
			// Click tracking for table of contents so we can see if people interact with it
			this.$( 'h2' ).on( 'click', function () {
				log( 'UI', 'page-toc-toggle' );
			} );
			this.$( 'a' ).on( 'click', function () {
				log( 'UI', 'page-toc-link' );
			} );
		}
	} );

	M.define( 'modules/toc/TableOfContents', TableOfContents );
}( mw.mobileFrontend ) );
