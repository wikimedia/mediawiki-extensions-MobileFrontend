// Flatten red links in JavaScript
( function( M, $ ) {
	if ( !mw.config.get( 'wgMFShowRedLinks' ) ) {
		$( function() {
			$( '#content a.new' ).each( function() {
				// Use html since links might contain sup or sub elements
				$( '<span class="new">' ).html( $( this ).html() ).insertAfter( this );
				$( this ).remove();
			} );
		} );
	}
}( mw.mobileFrontend, jQuery ) );
