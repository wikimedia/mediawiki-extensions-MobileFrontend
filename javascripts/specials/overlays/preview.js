( function( M, $ ) {
	var Overlay = M.require( 'navigation' ).Overlay,
		Page = M.require( 'page' ),
		LoadingOverlay = Overlay.extend( {
			defaults: {
				msg: mw.msg( 'mobile-frontend-ajax-preview-loading' )
			},
			template: M.template.get( 'overlays/loading' )
		} ),
		PagePreviewOverlay = Overlay.extend( {
			template: M.template.get( 'overlays/pagePreview' ),
			preRender: function( options ) {
				options.heading = options.page.title;
				options.content = options.page.lead;
				options.url = M.history.getArticleUrl( options.heading );
				options.readMoreLink = mw.msg( 'mobile-frontend-nearby-link' );
			},
			initialize: function( options ) {
				this._super( options );
				this.$( '.content table' ).remove();
			}
		} ),
		module = M.require( 'nearby' ),
		endpoint = module.endpoint,
		nearby = module.overlay;

	nearby.on( 'page-click', function( ev ) {
		ev.preventDefault();
		var loader = new LoadingOverlay(),
			title = $( ev.currentTarget ).find( 'h2' ).text();
		loader.show();

		M.history.retrievePage( title, endpoint ).done( function( page ) {
			var preview = new PagePreviewOverlay( { page: new Page( page ) } );
			loader.hide();
			preview.show();
		} ).fail( function() {
			loader.hide(); // FIXME: do something more meaningful e.g. error overlay
		} );
	} );

}( mw.mobileFrontend, jQuery ) );
