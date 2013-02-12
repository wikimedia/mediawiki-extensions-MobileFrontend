( function( $, M ) {
	var star = M.require( 'watchstar' );

	// FIXME: Kill the need for this horrible function by giving me a nicer API
	function getPagesFromQueryResult( result ) {
		var key, pages = {}, allPages = result.query.pages;
		for ( key in allPages ) {
			if ( allPages.hasOwnProperty( key ) ) {
				pages[ allPages[ key ].title ] = allPages[ key ];
			}
		}
		return pages;
	}

	function initWatchlistThumbnails() {
		var titles = [], $items = $( 'ul.mw-mf-watchlist-results li h2' );

		$items.each( function() {
			titles.push( $( this ).text() );
		} );

		$.ajax( {
			url: M.getApiUrl(),
			dataType: 'json',
			data: {
				action: 'query',
				format: 'json',
				prop: 'pageimages',
				pithumbsize: 180, // ask for a big enough thumbnail for Modified view
				titles: titles.join( '|' )
			}
		} ).done( function( r ) {
			var pages = getPagesFromQueryResult( r );

			$items.each( function() {
				var $el = $( this ), page = pages[ $el.text() ];
				if ( page && page.thumbnail ) {
					$( '<div class="listThumb">' ).
						css( 'background-image', 'url(' + page.thumbnail.source + ')' ).
						addClass( page.thumbnail.width > page.thumbnail.height ? 'listThumbH' : 'listThumbV' ).
						prependTo( $el.parents( 'a' ) );
				}
			} );
		} );
	}

	function init() {
		if ( $( 'ul.mw-mf-watchlist-results li' ).length > 0 && M.getConfig( 'alpha' ) ) {
			initWatchlistThumbnails();
		}
		// FIXME: find more elegant way to not show watchlist stars on recent changes
		if ( $( '.mw-mf-watchlist-selector' ).length === 0 ) {
			star.initWatchListIconList( $( 'ul.mw-mf-watchlist-results' ), true );
		}
	}

	$( document ).ready( function() {
		init();
	} );

} )( jQuery, mw.mobileFrontend );
