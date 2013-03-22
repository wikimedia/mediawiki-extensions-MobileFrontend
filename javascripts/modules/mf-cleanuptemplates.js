( function( M,  $ ) {

var module = (function() {
	var nav = M.require( 'navigation' );

	function run() {
		var $metadata = $( '#content_0 table.ambox' ),
			$container = $( '<div class="content">' );

		$metadata.each( function() {
			if ( $( this ).find( 'table.ambox' ).length === 0 ) {
				$container.append( $( this ).clone() );
			}
		} );

		$( '<a class="mw-mf-cleanup">' ).click( function() {
			nav.createOverlay( M.message( 'mobile-frontend-meta-data-issues-header' ), $container[ 0 ] );
		} ).text( M.message( 'mobile-frontend-meta-data-issues' ) ).insertBefore( $metadata.eq( 0 ) );
		$metadata.remove();
	}

	function init() {
		run();
		M.on( 'page-loaded', run );
	}

	return {
		init: init,
		run: run
	};
}() );

M.define( 'cleanuptemplates', module );

}( mw.mobileFrontend, jQuery ));
