( function ( M, $ ) {
	var time = M.require( 'modules/lastEdited/time' ),
		MainMenu = M.require( 'MainMenu' ),
		mainMenu = new MainMenu( {
			// FIXME: remove #mw-mf-main-menu-button when cache clears
			activator: '#mw-mf-main-menu-button, .header .main-menu-button'
		} );

	/**
	 * Initialisation function for last modified module.
	 *
	 * Enhances #mw-mf-last-modified element
	 * to show a human friendly date in seconds, minutes, hours, days
	 * months or years
	 * @ignore
	 */
	function initHistoryLink() {
		var delta,
			$lastModified = $( '#mw-mf-last-modified' ),
			$lastModifiedLink = $lastModified.find( 'a' ),
			historyUrl = $lastModifiedLink.attr( 'href' ),
			ts = $lastModifiedLink.data( 'timestamp' ),
			username = $lastModifiedLink.data( 'user-name' ) || false,
			gender = $lastModifiedLink.data( 'user-gender' );

		if ( ts ) {
			delta = time.getTimeAgoDelta( parseInt( ts, 10 ) );
			if ( time.isRecent( delta ) ) {
				$lastModified.parent( '.last-modified-bar' ).addClass( 'active' );
			}

			$lastModifiedLink.replaceWith( time.getLastModifiedMessage( ts, historyUrl, username, gender ) );
		}
	}

	// bind events
	M.define( 'mainMenu', mainMenu );
	M.on( 'history-link-loaded', initHistoryLink );
	M.on( 'header-loaded', function () {
		// Now we have a main menu button register it.
		mainMenu.registerClickEvents();
	} );

	$( function () {
		if ( !$( '#mw-mf-page-left' ).find( '.menu' ).length ) {
			mainMenu.appendTo( '#mw-mf-page-left' );
		}
	} );

}( mw.mobileFrontend, jQuery ) );
