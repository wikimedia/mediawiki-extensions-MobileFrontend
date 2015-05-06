( function ( M, $ ) {
	var SchemaMobileWebBrowse = M.require( 'loggingSchemas/SchemaMobileWebBrowse' ),
		schema = new SchemaMobileWebBrowse(),
		$collectionCard = $( '.collection-card' );

	// log article_click
	$( function () {
		$collectionCard.find( 'a' ).one( 'click', function () {
			var $link = $( this ),
				articleLink = $link.attr( 'href' ) || '',
				$card = $link.parents( '.collection-card' );

			schema.logBeacon( {
				action: 'article_click',
				tag: mw.config.get( 'wgTitle' ).split( '/' ).pop(),
				article: articleLink.replace( '/wiki/', '' ),
				articleIndex: $card.index() + 1
			} );
		} );
	} );

}( mw.mobileFrontend, jQuery ) );

