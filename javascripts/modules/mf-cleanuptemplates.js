/*global document, window, mw, navigator, jQuery */
/*jslint sloppy: true, white:true, maxerr: 50, indent: 4, plusplus: true*/
( function( M,  $ ) {

var module = (function() {
	var nav = M.getModule( 'navigation' );

	function init() {
		var $metadata = $( '#content_0 table.ambox' ),
			$container = $( '<div>' );

		$metadata.each( function() {
			if ( $( this ).find( 'table.ambox' ).length === 0 ) {
				$container.append( $( this ).clone() );
			}
		} );

		$( '<a class="mw-mf-cleanup">' ).click( function() {
			nav.createOverlay( M.message( 'mobile-frontend-meta-data-issues-header' ), $container[ 0 ] );
		} ).text( M.message( 'mobile-frontend-meta-data-issues' ) ).insertBefore( $metadata.eq( 0 ) );
		$metadata.remove();

		$( window ).on( 'mw-mf-page-loaded', init );
	}

	return {
		init: init
	};
}() );

M.registerModule( 'cleanuptemplates', module );

}( mw.mobileFrontend, jQuery ));
