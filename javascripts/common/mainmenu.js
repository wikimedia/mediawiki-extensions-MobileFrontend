( function( M, $ ) {
	var
		moved = false;

	function isOpen() {
		return $( 'body' ).hasClass( 'navigation-enabled' );
	}

	/**
	 * Closes all open navigation drawers
	 * @name mainmenu.closeNavigationDrawers
	 */
	function closeNavigationDrawers() {
		$( 'body' ).removeClass( 'navigation-enabled' ).
			removeClass( 'secondary-navigation-enabled' ).
			removeClass( 'primary-navigation-enabled' );
	}

	/**
	 * @name mainmenu.openNavigationDrawer
	 * @param {String} drawerType A name that identifies the navigation drawer that should be toggled open
	 */
	function openNavigationDrawer( drawerType ) {
		// close any existing ones first.
		closeNavigationDrawers();
		drawerType = drawerType || 'primary';
		$( 'body' ).toggleClass( 'navigation-enabled' ).
			toggleClass( drawerType + '-navigation-enabled' );
	}

	function initialize() {
		// FIXME change when micro.tap.js in stable
		if ( M.isBetaGroupMember() ) {
			// make the input readonly to avoid accidental focusing when closing menu
			// (when JS is on, this input should not be used for typing anyway)
			$( '#searchInput' ).prop( 'readonly', true );
			$( '#mw-mf-main-menu-button' ).on( 'tap', function( ev ) {
				if ( isOpen() ) {
					closeNavigationDrawers();
				} else {
					openNavigationDrawer();
				}
				ev.preventDefault();
				ev.stopPropagation();
			} );

			// close navigation if content tapped
			$( '#mw-mf-page-center' ).on( 'tap', function(ev) {
				if ( isOpen() ) {
					closeNavigationDrawers();
					ev.preventDefault();
				}
			} );
		} else {
			$( '#mw-mf-main-menu-button' ).click( function( ev ) {
				if ( isOpen() ) {
					closeNavigationDrawers();
				} else {
					openNavigationDrawer();
				}
				ev.preventDefault();
			} ).on( 'touchend mouseup', function( ev ) {
				ev.stopPropagation();
			} );

			// close navigation if content tapped
			$( '#mw-mf-page-center' ).
				on( 'touchend mouseup', function() {
					if ( isOpen() && !moved ) {
						closeNavigationDrawers();
					}
				} ).
				// but don't close if scrolled
				on( 'touchstart', function() { moved = false; } ).
				on( 'touchmove', function() { moved = true; } );
		}
	}

	M.define( 'mainmenu', {
		openNavigationDrawer: openNavigationDrawer,
		closeNavigationDrawers: closeNavigationDrawers
	} );

	M.on( 'header-loaded', initialize );

}( mw.mobileFrontend, jQuery ));
