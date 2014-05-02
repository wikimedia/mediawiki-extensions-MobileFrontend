( function( M, $ ) {

	function isOpen() {
		return $( 'body' ).hasClass( 'navigation-enabled' );
	}

	/**
	 * Closes all open navigation drawers
	 */
	function closeNavigationDrawers() {
		$( 'body' ).removeClass( 'navigation-enabled' ).
			removeClass( 'secondary-navigation-enabled' ).
			removeClass( 'primary-navigation-enabled' );
	}

	/**
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
		// FIXME: duplicate code in application.js which is not available here.
		var tapEvent = M.isBetaGroupMember() ? 'tap' : 'mousedown';

		// make the input readonly to avoid accidental focusing when closing menu
		// (when JS is on, this input should not be used for typing anyway)
		$( '#searchInput' ).prop( 'readonly', true );
		// FIXME change when micro.tap.js in stable
		$( '#mw-mf-main-menu-button' ).on( tapEvent, function( ev ) {
			if ( isOpen() ) {
				closeNavigationDrawers();
			} else {
				openNavigationDrawer();
			}
			ev.preventDefault();
			ev.stopPropagation();
		} );

		// close navigation if content tapped
		$( '#mw-mf-page-center' ).on( tapEvent, function(ev) {
			if ( isOpen() ) {
				closeNavigationDrawers();
				ev.preventDefault();
			}
		} );
		if ( M.isBetaGroupMember() ) {
			// Move when notification drawer in stable
			$( '<div class="transparent-shield cloaked-element">' ).appendTo( '#mw-mf-page-center' );
		}
	}

	M.define( 'mainmenu', {
		openNavigationDrawer: openNavigationDrawer,
		closeNavigationDrawers: closeNavigationDrawers
	} );

	M.on( 'header-loaded', initialize );

}( mw.mobileFrontend, jQuery ));
