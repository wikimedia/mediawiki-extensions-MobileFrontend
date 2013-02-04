( function( $ ) {

	// removes all inline styles from html output
	// see http://www.mediawiki.org/wiki/Deprecating_inline_styles
	$( function() {
		function scrub( $container ) {
			$container.find( '[style]' ).removeAttr( 'style' );
		}

		$( window ).on( 'mw-mf-section-rendered', function( ev, $container ) {
			scrub( $container );
		} ).on( 'mw-mf-page-loaded', function() {
			scrub( $( '#content_0' ) );
		} );
		scrub( $( '#content' ) );

	} );

} ( jQuery ) );
