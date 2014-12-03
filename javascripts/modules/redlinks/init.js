// Flatten red links in JavaScript
( function ( M, $ ) {
	if ( !mw.config.get( 'wgMFShowRedLinks' ) ) {
		$( function () {
			$( '#content a.new' ).each( function () {
				$( this ).replaceWith(
					$( '<span class="new"></span>' ).append( $( this ).contents() )
				);
			} );
		} );
	}
}( mw.mobileFrontend, jQuery ) );
