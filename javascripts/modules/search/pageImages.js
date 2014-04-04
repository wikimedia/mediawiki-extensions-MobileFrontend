( function( M, $ ) {

	var delay = M.isWideScreen() ? 0 : 1000;

	function renderPageImages( overlay, results ) {
		var pages = {},
			$ul = overlay.$( 'ul' );

		$.each( results, function( i, page ) {
			var thumb;
			if ( page.thumbnail ) {
				thumb = page.thumbnail;
				page.listThumbStyleAttribute = 'background-image: url(' + thumb.source + ')';
				page.pageimageClass = thumb.width > thumb.height ? 'listThumbH' : 'listThumbV';
			} else {
				page.pageimageClass = 'needsPhoto';
			}
			pages[page.title] = page;
		} );

		// Render page images
		$ul.find( 'li' ).each( function() {
			var $li = $( this ),
				title = $li.attr( 'title' ),
				page = pages[title];

			if ( page ) {
				$li.find( '.listThumb' ).addClass( page.pageimageClass )
					.attr( 'style', page.listThumbStyleAttribute );
			}
		} );
	}

	// Add event to retrieve page images when images not disabled
	if ( !mw.config.get( 'wgImagesDisabled' ) ) {
		M.on( 'search-results', function( overlay, results ) {
			window.setTimeout( function() {
				renderPageImages( overlay, results );
			}, delay );
		} );
	}

}( mw.mobileFrontend, jQuery ) );
