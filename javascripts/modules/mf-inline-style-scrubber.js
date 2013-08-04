( function( M, $ ) {

	// removes all inline styles from html output
	// see https://www.mediawiki.org/wiki/Deprecating_inline_styles
	$( function() {
		var isSpecialPage = mw.config.get( 'wgNamespaceNumber' ) === mw.config.get( 'wgNamespaceIds' ).special;
		function scrub( $container ) {
			if ( !isSpecialPage ) {
				$container.find( '[style]' ).removeAttr( 'style' );
			}
		}

		M.
			on( 'section-rendered', scrub ).
			on( 'page-loaded', function() {
				scrub( $( '#content_0' ) );
			} );
		scrub( $( '#content' ) );

	} );

} ( mw.mobileFrontend, jQuery ) );
