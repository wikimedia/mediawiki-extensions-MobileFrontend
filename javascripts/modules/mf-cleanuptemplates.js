( function( M,  $ ) {

var module = (function() {
	var nav = M.require( 'navigation' ),
		Overlay = nav.Overlay,
		CleanupOverlay = Overlay.extend( {
			template: M.template.get( 'overlays/cleanup' )
		} );

	function run() {
		var $metadata = $( '#content_0 table.ambox' ),
			overlay,
			$container = $( '<div>' );

		$metadata.each( function() {
			if ( $( this ).find( 'table.ambox' ).length === 0 ) {
				$container.append( $( this ).clone() );
			}
		} );

		overlay = new CleanupOverlay( {
			heading: M.message( 'mobile-frontend-meta-data-issues-header' ),
			content: $container.html()
		} );

		$( '<a class="mw-mf-cleanup">' ).click( function() {
			overlay.show();
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
