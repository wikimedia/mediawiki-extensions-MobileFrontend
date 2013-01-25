( function( M, $ ) {

	// removes all inline styles from html output
	// see http://www.mediawiki.org/wiki/Deprecating_inline_styles
	$( function() {
		function scrub( $container ) {
			$container.find( '[style]' ).removeAttr( 'style' );
		}

		M.on( 'section-rendered', function( ev, $container ) {
			scrub( $container );
		} ).on( 'page-loaded', function() {
			scrub( $( '#content_0' ) );
		} );
		scrub( $( '#content' ) );

	} );

} ( mw.mobileFrontend, jQuery ) );
