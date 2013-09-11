( function( M, $ ) {

	var searchOverlay = M.require( 'search' ).overlay,
		history = M.history,
		// FIXME: use fuzzy link hijacking in the main namespace - core should be updated to make links more explicit
		useFuzzyLinkHijacking = mw.config.get( 'wgNamespaceNumber' ) === mw.config.get( 'wgNamespaceIds' )[''];

	if ( history.hijackLinks ) {
		history.hijackLinks( $( '#content' ), useFuzzyLinkHijacking );

		M.on( 'section-rendered', function( $container ) {
			history.hijackLinks( $container, useFuzzyLinkHijacking );
		} ).on( 'page-loaded', function( page ) {
			var title = M.prettyEncodeTitle( page.title );

			// Change UI to reflect new current page - Fix menu item returnto link
			// FIXME: give menu items with returnto=[article] generic class name
			$( '#mw-mf-page-left' ).find( '.icon-settings, .icon-loginout' ).find( 'a' ).each( function() {
				var href = $( this ).attr( 'href' );
				$( this ).attr( 'href', history.updateQueryStringParameter( href, 'returnto', title ) );
			} );

			history.hijackLinks( M.getLeadSection(), useFuzzyLinkHijacking );
		} );

		searchOverlay.on( 'write-results', function() {
			var $results = searchOverlay.$( 'ul' );
			history.hijackLinks( $results );
			$results.find( 'a' ).on( 'click', function() {
				searchOverlay.hide();
			} );
		} );
	}

}( mw.mobileFrontend, jQuery ) );
