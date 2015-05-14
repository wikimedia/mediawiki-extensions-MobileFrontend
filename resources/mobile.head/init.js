( function ( M, $ ) {
	var time = M.require( 'modules/lastEdited/time' ),
		MainMenu = M.require( 'MainMenu' ),
		mainMenu = new MainMenu();

	/**
	 * Initialisation function for last modified module.
	 *
	 * Enhances #mw-mf-last-modified element
	 * to show a human friendly date in seconds, minutes, hours, days
	 * months or years
	 * @ignore
	 */
	function initHistoryLink() {
		var $lastModified = $( '#mw-mf-last-modified' ),
			$lastModifiedLink = $lastModified.find( 'a' ),
			historyUrl = $lastModifiedLink.attr( 'href' ),
			ts = $lastModifiedLink.data( 'timestamp' ),
			username = $lastModifiedLink.data( 'user-name' ) || false,
			gender = $lastModifiedLink.data( 'user-gender' ),
			keys = {
				seconds: 'mobile-frontend-last-modified-with-user-seconds',
				minutes: 'mobile-frontend-last-modified-with-user-minutes',
				hours: 'mobile-frontend-last-modified-with-user-hours',
				days: 'mobile-frontend-last-modified-with-user-days',
				months: 'mobile-frontend-last-modified-with-user-months',
				years: 'mobile-frontend-last-modified-with-user-years'
			},
			delta, args = [];

		if ( ts ) {
			delta = time.getTimeAgoDelta( parseInt( ts, 10 ) );
			if ( time.isNow( delta ) ) {
				args = args.concat( [ 'mobile-frontend-last-modified-with-user-just-now', gender, username ] );
			} else {
				args = args.concat( [ keys[ delta.unit ], gender, username,
					mw.language.convertNumber( delta.value )
				] );
			}
			if ( time.isRecent( delta ) ) {
				$lastModified.parent( '.last-modified-bar' ).addClass( 'active' );
			}

			args = args.concat( [ historyUrl,
				// Abuse PLURAL support to determine if the user is anonymous or not
				mw.language.convertNumber( username ? 1 : 0 ),
				// I'll abuse of PLURAL support means we have to pass the relative URL rather than construct it from a wikilink
				username ? mw.util.getUrl( 'Special:UserProfile/' + username ) : ''
			] );

			$lastModifiedLink.html( mw.message.apply( this, args ).parse() );

			// FIXME: remove this when the cache clears. Today is 05/21/2015.
			// Make the cached DOM look similar to the new DOM
			if ( $lastModified.hasClass( 'last-modified-bar' ) ) {
				$lastModified
					.removeClass( 'last-modified-bar' )
					.wrap( '<div class="last-modified-bar"></div>' );
			}
		} else {
			// FIXME: remove this when the cache clears. Today is 05/21/2015.
			// Make the cached DOM look similar to the new DOM on the Main_Page
			// It's important that this runs when the DOM is ready, otherwise it won't work
			// in stable where the 'history-link-loaded' event is fired before the DOM is ready.
			$( function () {
				$( '#mw-mf-last-modified' ).removeClass( 'last-modified-bar' );
			} );
		}
	}

	// bind events
	M.on( 'history-link-loaded', initHistoryLink );
	M.on( 'header-loaded', function () {
		// Render MainMenu when needed
		// In alpha there is no #mw-mf-main-menu-button, the user can click on the header
		// search icon or the site name in the header to open the main menu
		$( '#mw-mf-main-menu-button, .alpha .header a.header-icon, .alpha .header .header-title a' )
			.on( 'click', function ( ev ) {
				mainMenu.openNavigationDrawer();
				ev.preventDefault();
				// Stop propagation, otherwise the Skin will close the open menus on page center click
				ev.stopPropagation();
			} );
	} );

	$( function () {
		if ( !$( '#mw-mf-page-left' ).find( '.menu' ).length ) {
			mainMenu.appendTo( '#mw-mf-page-left' );
		}
	} );

}( mw.mobileFrontend, jQuery ) );
