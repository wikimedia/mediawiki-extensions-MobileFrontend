( function ( M ) {
	var TableOfContents = M.require( 'modules/toc/TableOfContents' ),
		toggle = M.require( 'toggle' );

	/**
	 * Create TableOfContents if the given Page has sections and is not the main page
	 * and wgMFTocEnabled config variable is set to true.
	 * @method
	 * @param {Page} page for which a TOC is generated
	 * @ignore
	 */
	function init( page ) {
		var toc,
			sections = page.getSections(),
			// TODO: remove wgTOC when caches with old HTML expire
			enableToc = mw.config.get( 'wgMFTocEnabled' ) || mw.config.get( 'wgTOC' );

		if ( enableToc ||
			// Fallback for old cached HTML, added 26 June, 2014
			( enableToc === null && sections.length > 0 && !page.isMainPage() ) )
		{
			toc = new TableOfContents( {
				sections: sections
			} );
			if ( mw.config.get( 'wgMFPageSections' ) ) {
				toc.appendTo( page.getLeadSectionElement() );
			} else {
				// don't show toc at end of page, when no sections there
				toc.insertAfter( '#toc' );
				// remove the original parser toc
				this.$( '#toc' ).remove();
				// prevent to float text right of toc
				this.$( '.toc-mobile' ).after( '<div style="clear:both;"></div>' );
			}
			toggle.enable( toc.$el, 'toc-' );
		}
	}

	// add a ToC only for "view" action (user is reading a page)
	if ( mw.config.get( 'wgAction' ) === 'view' ) {
		init( M.getCurrentPage() );
	}

}( mw.mobileFrontend ) );
