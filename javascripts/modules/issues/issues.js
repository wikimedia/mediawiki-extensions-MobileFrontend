( function( M, $ ) {

var module = (function() {
	var
		Overlay = M.require( 'Overlay' ),
		// FIXME: Separate into separate file
		CleanupOverlay = Overlay.extend( {
			defaults: $.extend( {}, Overlay.prototype.defaults, {
				heading: '<strong>' + mw.msg( 'mobile-frontend-meta-data-issues-header' ) + '</strong>'
			} ),
			templatePartials: {
				content: M.template.get( 'overlays/cleanup' )
			}
		} );

	function run( $container ) {
		$container = $container || M.getLeadSection();
		var $metadata = $container.find( 'table.ambox' ),
			issues = [],
			$link;

		// clean it up a little
		$metadata.find( '.NavFrame' ).remove();

		$metadata.each( function() {
			var $this = $( this ), issue;

			if ( $( this ).find( 'table.ambox' ).length === 0 ) {
				// FIXME: [templates] might be inconsistent
				issue = {
					// .ambox- is used e.g. on eswiki
					text: $this.find( '.mbox-text, .ambox-text' ).html()
				};
				issues.push( issue );
			}
		} );

		$link = $( '<a class="mw-mf-cleanup icon icon-text">' ).attr( 'href', '#/issues' );
		M.overlayManager.add( /^\/issues$/, function() {
			return new CleanupOverlay( { issues: issues } );
		} );

		$link.text( mw.msg( 'mobile-frontend-meta-data-issues' ) ).insertBefore( $metadata.eq( 0 ) );
		$metadata.remove();
	}

	function initPageIssues( $container ) {
		if ( mw.config.get( 'wgNamespaceNumber' ) === 0 ) {
			run( $container );
		}
	}

	initPageIssues();
	M.on( 'page-loaded', function() {
		initPageIssues();
	} );
	M.on( 'edit-preview', function( overlay ) {
		initPageIssues( overlay.$el );
	} );

	return {
		run: run
	};
}() );

M.define( 'cleanuptemplates', module );

}( mw.mobileFrontend, jQuery ));
