( function( M, $ ) {
	M.assertMode( [ 'alpha', 'app' ] );

	var history = M.history,
		// FIXME: use fuzzy link hijacking in the main namespace - core should be updated to make links more explicit
		useFuzzyLinkHijacking = M.inNamespace( '' ) || M.isApp();

	if ( history.hijackLinks ) {
		history.hijackLinks( $( '#content' ), useFuzzyLinkHijacking );

		M.on( 'page-loaded', function( page ) {
			var title = M.prettyEncodeTitle( page.title );

			// Change UI to reflect new current page - Fix menu item returnto link
			// FIXME: give menu items with returnto=[article] generic class name
			$( '#mw-mf-page-left' ).find( '.icon-settings, .icon-loginout' ).find( 'a' ).each( function() {
				var href = $( this ).attr( 'href' );
				$( this ).attr( 'href', history.updateQueryStringParameter( href, 'returnto', title ) );
			} );

			history.hijackLinks( M.getLeadSection(), useFuzzyLinkHijacking );
		} );

		M.on( 'search-results', function( overlay ) {
			var $results = overlay.$( '.results' );
			history.hijackLinks( $results, false, true );
			$results.find( 'a' ).on( 'click', function() {
				overlay.hide();
			} );
		} );
	}

}( mw.mobileFrontend, jQuery ) );
