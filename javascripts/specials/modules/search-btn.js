( function( M, $ ) {

var search = M.require( 'search' );

if ( mw.config.get( 'wgNamespaceNumber' ) === mw.config.get( 'wgNamespaceIds' ).special &&
	mw.config.get( 'wgCanonicalSpecialPageName' ) !== 'Nearby' ) {// FIXME: allow nearby to have search & refresh icon
	$( '<a class="search-button">' ).attr( 'href', '#' ).
		on( 'click', function() {
			search.overlay.showAndFocus();
		} ).
		appendTo( '.header' );
}

}( mw.mobileFrontend, jQuery ) );
