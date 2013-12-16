( function( M, $ ) {
	M.assertMode( [ 'alpha', 'beta' ] );

	var toggle = M.require( 'toggle' );
	function enableKeyboardActions( $headings ) {
		$headings.on( 'keypress', function( ev ) {
			if ( ev.which === 13 || ev.which === 32 ) {
				// Only handle keypresses on the "Enter" or "Space" keys
				toggle.toggle( $( this ) );
			}
		} );

		// Make sure certain actions from child links don't bubble up, so
		// that users can still use them without toggling a section.
		$headings.find( 'a' ).on( 'keypress mouseup', function( ev ) {
			ev.stopPropagation();
		} );
	}
	M.on( 'toggling-enabled', enableKeyboardActions );
	$( function() {
		enableKeyboardActions( $( '#content .section_heading' ) );
	} );

}( mw.mobileFrontend, jQuery ) );
