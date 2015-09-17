( function ( M, $ ) {
	var time = M.require( 'mobile.modifiedBar/time' ),
		MainMenu = M.require( 'mobile.mainMenu/MainMenu' ),
		mainMenu = new MainMenu( {
			activator: '.header .main-menu-button'
		} );

	/**
	 * Initialisation function for last modified module.
	 *
	 * Enhances #mw-mf-last-modified element
	 * to show a human friendly date in seconds, minutes, hours, days
	 * months or years
	 * @param {jQuery.Object} $lastModifiedLink element to enhance
	 * @ignore
	 */
	function initHistoryLink( $lastModifiedLink ) {
		var delta, historyUrl, msg,
			ts, username, gender;

		$lastModifiedLink = $lastModifiedLink || $( '#mw-mf-last-modified a' );
		historyUrl = $lastModifiedLink.attr( 'href' );
		ts = $lastModifiedLink.data( 'timestamp' );
		username = $lastModifiedLink.data( 'user-name' ) || false;
		gender = $lastModifiedLink.data( 'user-gender' );

		if ( ts ) {
			delta = time.getTimeAgoDelta( parseInt( ts, 10 ) );
			if ( time.isRecent( delta ) ) {
				$lastModifiedLink.closest( '.last-modified-bar' ).addClass( 'active' );
			}
			msg = time.getLastModifiedMessage( ts, username, gender, historyUrl );
			$lastModifiedLink.replaceWith( msg );
		}
	}

	/**
	 * Initialisation function for last modified module.
	 *
	 * Enhances #mw-mf-last-modified element
	 * to show a human friendly date in seconds, minutes, hours, days
	 * months or years
	 * @ignore
	 */
	function initModifiedInfo() {
		$( '.modified-enhancement' ).each( function () {
			initHistoryLink( $( this ) );
		} );
	}

	// bind events
	M.define( 'mobile.head/mainMenu', mainMenu ).deprecate( 'mainMenu' );
	// FIXME: Remove when cache expires. https://phabricator.wikimedia.org/T112315
	M.on( 'history-link-loaded', initHistoryLink );
	M.on( 'header-loaded', function () {
		// Now we have a main menu button register it.
		mainMenu.registerClickEvents();
	} );

	$( function () {
		// Update anything else that needs enhancing (e.g. watchlist)
		initModifiedInfo();
		if ( !$( '#mw-mf-page-left' ).find( '.menu' ).length ) {
			mainMenu.appendTo( '#mw-mf-page-left' );
		}
		initHistoryLink();
	} );

}( mw.mobileFrontend, jQuery ) );
