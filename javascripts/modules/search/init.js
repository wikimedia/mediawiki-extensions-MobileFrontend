( function ( M, $ ) {

	var SearchOverlay = M.require( 'modules/search/SearchOverlay' ),
		schema = M.require( 'loggingSchemas/MobileWebClickTracking' ),
		browser = M.require( 'browser' );

	/**
	 * Reveal the search overlay
	 * @param {jQuery.Event} ev
	 * @ignore
	 */
	function openSearchOverlay( ev ) {
		ev.preventDefault();
		schema.log( 'UI', 'search' );
		new SearchOverlay( {
			searchTerm: $( this ).val()
		} ).show();
		M.router.navigate( '/search' );
	}

	// See https://phabricator.wikimedia.org/T76882 for why we disable search on Android 2
	if ( browser.isAndroid2() ) {
		$( 'body' ).addClass( 'client-use-basic-search' );
	} else {
		// don't use focus event (https://bugzilla.wikimedia.org/show_bug.cgi?id=47499)
		//
		// focus() (see SearchOverlay#show) opens virtual keyboard only if triggered
		// from user context event, so using it in route callback won't work
		// http://stackoverflow.com/questions/6837543/show-virtual-keyboard-on-mobile-phones-in-javascript
		$( '#searchInput' ).on( 'click', openSearchOverlay )
			// FIXME: Review the need for this, especially given latest alpha developments
			// Apparently needed for main menu to work correctly.
			.prop( 'readonly', true );
	}

	// FIXME: ugly hack that removes search from browser history when navigating
	// to search results (we can't rely on History API yet)
	// alpha does it differently in lazyload.js
	if ( !M.isAlphaGroupMember() ) {
		M.on( 'search-results', function ( overlay ) {
			overlay.$( '.results a' ).on( 'click', function () {
				var href = $( this ).attr( 'href' );
				M.router.back().done( function () {
					window.location.href = href;
				} );
				// Prevent the link from working and prevent the closing of the overlay
				// by an event upstream which would trigger browser back on the clicked link
				return false;
			} );
		} );
	}

}( mw.mobileFrontend, jQuery ) );
