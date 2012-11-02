/*global document, window, mw, navigator, jQuery */
/*jslint sloppy: true, white:true, maxerr: 50, indent: 4, plusplus: true*/
( function( M,  $ ) {

var module = (function() {
	var nav = M.getModule( 'navigation' );

	function init() {
		var $metadata = $( '#content_0 table.ambox' ),
			clones = [];

		$metadata.each( function() {
			if ( $( this ).children( 'table.ambox' ).length === 0 ) {
				clones.push( this );
			}
		} );
		$( '<button class="mw-mf-cleanup">' ).click( function() {
			nav.createOverlay( M.message( 'mobile-frontend-meta-data-issues-header' ), clones );
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
