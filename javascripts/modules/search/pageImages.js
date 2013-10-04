( function( M, $ ) {

	var Api = M.require( 'api' ).Api,
		// impose a 1 second delay for smaller devices to minimise data charges
		delay = M.isWideScreen() ? 0 : 1000,
		PageImageApi = Api.extend( {
			getPageImages: function( titles ) {
				var result = $.Deferred();
				this.abort();
				this.get( {
					action: 'query',
					prop: 'pageimages',
					titles: titles,
					pithumbsize: 80,
					pilimit: 50
				} ).always( function( resp ) {
					var pages = {};
					// FIXME: Deal with all possible API responses
					if ( !resp || resp.error || !resp.query || !resp.query.pages ) {
						result.reject();
					} else {
						// FIXME: API returns object when array would make much sense
						$.each( resp.query.pages , function( id, page ) {
							var thumb;
							if ( page.thumbnail ) {
								thumb = page.thumbnail;
								page.listThumbStyleAttribute = 'background-image: url(' + thumb.source + ')';
								page.pageimageClass = thumb.width > thumb.height ? 'listThumbH' : 'listThumbV';
							} else {
								page.pageimageClass = 'needsPhoto';
							}
							pages[ page.title ] = page;
						} );
						result.resolve( pages );
					}
				} );
				return result;
			}
		} ),
		piApi = new PageImageApi(),
		overlay = M.require( 'search' ).overlay;

	function renderPageImages( results ) {
		var titles = $.map( results, function( r ) { return r.title; } );

		piApi.getPageImages( titles ).done( function( pages ) {
			var $ul = overlay.$( 'ul' );
			// Render page images
			$ul.find( 'li' ).each( function() {
				var $li = $( this ),
					title = $li.attr( 'title' ),
					page = pages[title];

				if ( page ) {
					$li.find( '.listThumb' ).addClass( page.pageimageClass ).
						attr( 'style', page.listThumbStyleAttribute );
				}
			} );
		} );
	}

	// Add event to retrieve page images when images not disabled
	if ( !mw.config.get( 'wgImagesDisabled' ) ) {
		overlay.on( 'write-results', function( results ) {
			window.setTimeout( function() {
				renderPageImages( results );
			}, delay );
		} );
	}

}( mw.mobileFrontend, jQuery ) );
