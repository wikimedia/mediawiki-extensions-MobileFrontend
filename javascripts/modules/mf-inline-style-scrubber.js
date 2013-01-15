( function( $ ) {

	// removes all inline styles from html output
	// see http://www.mediawiki.org/wiki/Deprecating_inline_styles
	$( function() {
		$( '#content [style]' ).removeAttr( 'style' );
	} );

} ( jQuery ) );