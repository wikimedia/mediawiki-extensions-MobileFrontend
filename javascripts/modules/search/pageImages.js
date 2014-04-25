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
				// Note: .icon class is added in the template
				page.pageimageClass = thumb.width > thumb.height ? 'icon-max-y' : 'icon-max-x';
			} else {
				// Note: .icon class is added in the template
				page.pageimageClass = 'needsPhoto icon-max-x';
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
