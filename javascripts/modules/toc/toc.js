( function( M ) {
	M.assertMode( [ 'beta', 'alpha' ] );
	var View = M.require( 'View' ), TableOfContents,
		toggle = M.require( 'toggle' );

	TableOfContents = View.extend( {
		templatePartials: {
			tocHeading: mw.template.get( 'modules/toc/tocHeading' )
		},
		defaults: {
			contentsMsg: mw.msg( 'toc' )
		},
		tagName: 'div',
		className: 'toc-mobile',
		template: mw.template.get( 'modules/toc/toc' )
	} );
	M.define( 'modules/toc/TableOfContents', TableOfContents );

	function init( page ) {
		var toc, sections = page.getSubSections();
		if ( sections.length > 0 && !page.isMainPage() ) {
			toc = new TableOfContents( {
				sections: sections
			} );
			toc.appendTo( M.getLeadSection() );
			toggle.enable( toc.$el );
		}
	}

	init( M.getCurrentPage() );
	M.on( 'page-loaded', init );

}( mw.mobileFrontend ) );
