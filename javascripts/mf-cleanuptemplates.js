/*global document, window, mw, navigator, jQuery */
/*jslint sloppy: true, white:true, maxerr: 50, indent: 4, plusplus: true*/
( function( M,  $ ) {

var module = (function() {
	var nav = M.getModule( 'navigation' );

	function init() {
		var $metadata = $( 'table.metadata' ),
			$clone = $metadata.clone();
		$( '<button class="mw-mf-cleanup">' ).click( function() {
			nav.createOverlay( M.message( 'mobile-frontend-meta-data-issues-header' ), $clone );
		} ).text( M.message( 'mobile-frontend-meta-data-issues' ) ).insertBefore( $metadata.eq( 0 ) );
		$metadata.remove();
	}

	return {
		init: init
	};
}() );

M.registerModule( 'cleanuptemplates', module );

}( mw.mobileFrontend, jQuery ));
