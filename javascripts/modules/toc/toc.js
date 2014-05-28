( function( M ) {
	M.assertMode( [ 'beta', 'alpha' ] );
	var View = M.require( 'View' ), TableOfContents,
		MobileWebClickTracking = M.require( 'loggingSchemas/MobileWebClickTracking' ),
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
		template: mw.template.get( 'modules/toc/toc' ),
		postRender: function( options ) {
			var log = MobileWebClickTracking.log;
			this._super( options );
			// Click tracking for table of contents so we can see if people interact with it
			this.$( 'h2' ).on( toggle.eventName, function() {
				log( 'page-toc-toggle' );
			} );
			this.$( 'a' ).on( 'click', function() {
				log( 'page-toc-link' );
			} );
		}
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
