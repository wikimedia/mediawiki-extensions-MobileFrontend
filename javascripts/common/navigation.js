( function( M, $ ) {

	var
		// FIXME: remove when header-loaded is in all cached pages
		initialized = false,
		inAlpha = mw.config.get( 'wgMFMode' ) === 'alpha';

	function initialize() {
		var
			moved = false,
			$body = $( 'body' );

		// FIXME: remove when header-loaded is in all cached pages
		if ( initialized ) {
			return;
		}
		initialized = true;

		function isOpen() {
			return $body.hasClass( 'navigation-enabled' );
		}

		function closeNavigation() {
			$body.removeClass( 'navigation-enabled' );
		}

		function toggleNavigation() {
			$body.toggleClass( 'navigation-enabled' );
		}

		$( '#mw-mf-page-left a' ).click( function() {
			toggleNavigation(); // close before following link so that certain browsers on back don't show menu open
		} );

		// FIXME change when micro.tap.js in stable
		if ( inAlpha ) {
			// make the input readonly to avoid accidental focusing when closing menu
			// (when JS is on, this input should not be used for typing anyway)
			$( '#searchInput' ).prop( 'readonly', true );
			$( '#mw-mf-main-menu-button' ).on( 'tap', function( ev ) {
				toggleNavigation();
				ev.preventDefault();
				ev.stopPropagation();
			} );

			// close navigation if content tapped
			$( '#mw-mf-page-center' ).on( 'tap', function(ev) {
				if ( isOpen() ) {
					closeNavigation();
					ev.preventDefault();
				}
			} );
		} else {
			$( '#mw-mf-main-menu-button' ).click( function( ev ) {
				toggleNavigation();
				ev.preventDefault();
			} ).on( 'touchend mouseup', function( ev ) {
				ev.stopPropagation();
			} );

			// close navigation if content tapped
			$( '#mw-mf-page-center' ).
				on( 'touchend mouseup', function() {
					if ( isOpen() && !moved ) {
						closeNavigation();
					}
				} ).
				// but don't close if scrolled
				on( 'touchstart', function() { moved = false; } ).
				on( 'touchmove', function() { moved = true; } );
		}
	}

	M.on( 'header-loaded', initialize );
	// FIXME: remove when header-loaded is in all cached pages
	$( initialize );

}( mw.mobileFrontend, jQuery ));
