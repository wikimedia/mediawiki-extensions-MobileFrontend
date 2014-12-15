( function ( M, $ ) {
	var browser = M.require( 'browser' );

	/**
	 * Check whether the navigation drawer is open
	 * @ignore
	 * @return {Boolean}
	 */
	function isOpen() {
		return $( 'body' ).hasClass( 'navigation-enabled' );
	}

	/**
	 * Closes all open navigation drawers
	 * @ignore
	 */
	function closeNavigationDrawers() {
		$( 'body' ).removeClass( 'navigation-enabled' )
			.removeClass( 'secondary-navigation-enabled' )
			.removeClass( 'primary-navigation-enabled' );
	}

	/**
	 * @param {String} drawerType A name that identifies the navigation drawer that should be toggled open
	 * @ignore
	 */
	function openNavigationDrawer( drawerType ) {
		// close any existing ones first.
		closeNavigationDrawers();
		drawerType = drawerType || 'primary';
		$( 'body' ).toggleClass( 'navigation-enabled' )
			.toggleClass( drawerType + '-navigation-enabled' );
	}

	/**
	 * Initialise the main menu
	 * @ignore
	 */
	function initialize() {
		// make the input readonly to avoid accidental focusing when closing menu
		// (when JS is on, this input should not be used for typing anyway)
		$( '#mw-mf-main-menu-button' ).on( 'click', function ( ev ) {
			if ( isOpen() ) {
				closeNavigationDrawers();
			} else {
				openNavigationDrawer();
			}
			ev.preventDefault();
		} );

		// close navigation if content tapped
		$( '#mw-mf-page-center' ).on( 'click', function ( ev ) {
			if ( ev.target.id !== 'mw-mf-main-menu-button' && isOpen() ) {
				closeNavigationDrawers();
				ev.preventDefault();
			}
		} );

		$( '<div class="transparent-shield cloaked-element">' ).appendTo( '#mw-mf-page-center' );
		if ( !browser.supportsGeoLocation() ) {
			$( '#mw-mf-page-left li.icon-nearby' ).remove();
		}
	}

	M.define( 'mainmenu', {
		openNavigationDrawer: openNavigationDrawer,
		closeNavigationDrawers: closeNavigationDrawers
	} );

	M.on( 'header-loaded', initialize );

}( mw.mobileFrontend, jQuery ) );
