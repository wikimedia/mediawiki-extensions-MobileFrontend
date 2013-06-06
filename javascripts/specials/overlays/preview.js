( function( M, $ ) {
	var Overlay = M.require( 'Overlay' ),
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
				options.preview = options.page.lead;
				options.url = M.history.getArticleUrl( options.heading );
				options.readMoreLink = mw.msg( 'mobile-frontend-nearby-link' );
			},
			postRender: function( options ) {
				var $preview, nodes;
				this._super( options );
				$preview = this.$( '.preview' );
				$preview.find( ' table,.dablink,.thumb' ).remove();
				// FIXME: IMO meta data should remain hidden from output
				nodes = $preview.find( 'p,div' ).map( function( i, el ) {
					if ( $( el ).find( '#coordinates' ).length === 0 ) {
						return el;
					}
				} );
				$preview.empty();
				$preview.append( nodes[0] );
			}
		} ),
		module = M.require( 'nearby' ),
		endpoint = module.endpoint;

	$( function() {
		// FIXME: temporary code, replace if previews get to stable or are removed
		module.getOverlay().openPage = function( ev ) {
			ev.preventDefault();
			var loader = new LoadingOverlay(),
				$a = $( ev.currentTarget ),
				title = $a.find( 'h2' ).text();
			loader.show();

			M.history.retrievePage( title, endpoint, true ).done( function( page ) {
				var preview = new PagePreviewOverlay( { page: new Page( page ), img: $( '<div>' ).append( $a.find( '.listThumb' ).clone() ).html() } );
				loader.hide();
				preview.show();
			} ).fail( function() {
				loader.hide(); // FIXME: do something more meaningful e.g. error overlay
			} );
		};
	} );
}( mw.mobileFrontend, jQuery ) );
