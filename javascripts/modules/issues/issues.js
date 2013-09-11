( function( M,  $ ) {

var module = (function() {
	var
		issues = [],
		Overlay = M.require( 'Overlay' ),
		CleanupOverlay = Overlay.extend( {
			defaults: $.extend( {}, Overlay.prototype.defaults, {
				heading: mw.msg( 'mobile-frontend-meta-data-issues-header' )
			} ),
			template: M.template.get( 'overlays/cleanup' )
		} );

	function run( $container, parentOverlay ) {
		$container = $container || M.getLeadSection();
		var $metadata = $container.find( 'table.ambox' ),
			overlay;

		// clean it up a little
		$metadata.find( '.NavFrame' ).remove();
		$metadata.each( function() {
			var $this = $( this );

			if ( $( this ).find( 'table.ambox' ).length === 0 ) {
				issues.push( {
					// FIXME: [templates] might be inconsistent
					// .ambox- is used e.g. on eswiki
					icon: $this.find( '.mbox-image img, .ambox-image img' ).attr( 'src' ),
					text: $this.find( '.mbox-text, .ambox-text' ).html()
				} );
			}
		} );

		overlay = new CleanupOverlay( {
			parent: parentOverlay,
			issues: issues
		} );

		$( '<a class="mw-mf-cleanup">' ).click( function() {
			overlay.show();
		} ).text( mw.msg( 'mobile-frontend-meta-data-issues' ) ).insertBefore( $metadata.eq( 0 ) );
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
