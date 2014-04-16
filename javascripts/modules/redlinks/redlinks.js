// Flatten red links in JavaScript
( function( M, $ ) {
	if ( !M.isBetaGroupMember() || mw.user.isAnon() ) {
		$( function() {
			$( 'a.new' ).each( function() {
				// Use html since links might contain sup or sub elements
				$( '<span class="new">' ).html( $( this ).html() ).insertAfter( this );
				$( this ).remove();
			} );
		} );
	}
}( mw.mobileFrontend, jQuery ) );
