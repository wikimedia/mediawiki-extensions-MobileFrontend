( function ( M ) {
	var TableOfContents,
		MobileWebClickTracking = M.require( 'loggingSchemas/MobileWebClickTracking' ),
		View = M.require( 'View' ),
		Icon = M.require( 'Icon' );

	/**
	 * View for table of contents
	 * @class TableOfContents
	 * @extends View
	 */
	TableOfContents = View.extend( {
		templatePartials: {
			tocHeading: mw.template.get( 'mobile.toc', 'heading.hogan' )
		},
		defaults: {
			tocIcon: new Icon( {
				tagName: 'span',
				name: 'toc',
				additionalClasses: 'icon-16px'
			} ).toHtmlString(),
			contentsMsg: mw.msg( 'toc' )
		},
		tagName: 'div',
		className: 'toc-mobile',
		template: mw.template.get( 'mobile.toc', 'toc.hogan' ),
		postRender: function () {
			var log = MobileWebClickTracking.log;
			View.prototype.postRender.apply( this, arguments );
			// Click tracking for table of contents so we can see if people interact with it
			this.$( 'h2' ).on( 'click', function () {
				log( 'page-toc-toggle' );
			} );
			this.$( 'a' ).on( 'click', function () {
				log( 'page-toc-link' );
			} );
		}
	} );

	M.define( 'modules/toc/TableOfContents', TableOfContents );
}( mw.mobileFrontend ) );
