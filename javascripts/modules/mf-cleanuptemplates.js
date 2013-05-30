( function( M,  $ ) {

var module = (function() {
	var nav = M.require( 'navigation' ),
		Overlay = nav.Overlay,
		CleanupOverlay = Overlay.extend( {
			template: M.template.get( 'overlays/cleanup' )
		} );

	function run( $container, parentOverlay ) {
		$container = $container || $( '#content_0' );
		var $metadata = $container.find( 'table.ambox' ),
			overlay,
			$tmp = $( '<div>' );

		$metadata.each( function() {
			if ( $( this ).find( 'table.ambox' ).length === 0 ) {
				$tmp.append( $( this ).clone() );
			}
		} );

		overlay = new CleanupOverlay( {
			parent: parentOverlay,
			heading: M.message( 'mobile-frontend-meta-data-issues-header' ),
			content: $tmp.html()
		} );

		$( '<a class="mw-mf-cleanup">' ).click( function() {
			overlay.show();
		} ).text( M.message( 'mobile-frontend-meta-data-issues' ) ).insertBefore( $metadata.eq( 0 ) );
		$metadata.remove();
	}

	function init() {
		run();
		M.on( 'page-loaded', function() {
			// don't page the page-loaded parameter to run.
			run();
		} );
		M.on( 'edit-preview', function( overlay ) {
			run( overlay.$el, overlay );
		} );
	}

	return {
		init: init,
		run: run
	};
}() );

M.define( 'cleanuptemplates', module );

}( mw.mobileFrontend, jQuery ));
