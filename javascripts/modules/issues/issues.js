( function( M,  $ ) {

var module = (function() {
	var
		issues = [],
		$link,
		useNewOverlays = mw.config.get( 'wgMFMode' ) !== 'stable',
		// FIXME: Promote to stable
		Overlay = M.require( useNewOverlays ? 'OverlayNew' : 'Overlay' ),
		// FIXME: Separate into separate file
		CleanupOverlay = Overlay.extend( {
			defaults: $.extend( {}, Overlay.prototype.defaults, {
				heading: mw.msg( 'mobile-frontend-meta-data-issues-header' )
			} ),
			templatePartials: {
				content: M.template.get( 'overlays/cleanup' )
			}
		} ),
		// FIXME: Merge into CleanupOverlay
		CleanupOverlayNew = CleanupOverlay.extend( {
			closeOnBack: true
		} );


	function run( $container, parentOverlay ) {
		$container = $container || M.getLeadSection();
		var $metadata = $container.find( 'table.ambox' ),
			overlay;

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
				// new overlays have same icon for all issues
				if ( !useNewOverlays ) {
					issue.icon = $this.find( '.mbox-image img, .ambox-image img' ).attr( 'src' );
				}
				issues.push( issue );
			}
		} );

		$link = $( '<a class="mw-mf-cleanup icon-24px">' );
		if ( useNewOverlays ) {
			overlay = new CleanupOverlayNew( {
				parent: parentOverlay,
				issues: issues
			} );
			$link.attr( 'href', '#issues' );
			M.router.route( /^issues$/, function() {
				overlay.show();
			} );
		} else {
			overlay = new CleanupOverlay( {
				parent: parentOverlay,
				issues: issues
			} );
			$link.on( 'click', $.proxy( overlay, 'show' ) );
		}

		$link.text( mw.msg( 'mobile-frontend-meta-data-issues' ) ).insertBefore( $metadata.eq( 0 ) );
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
