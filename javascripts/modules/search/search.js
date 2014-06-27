( function( M, $ ) {

	var SearchOverlay = M.require( 'modules/search/SearchOverlay' );

	// FIXME change when micro.tap.js in stable
	//
	// don't use focus event (https://bugzilla.wikimedia.org/show_bug.cgi?id=47499)
	//
	// focus() (see SearchOverlay#show) opens virtual keyboard only if triggered
	// from user context event, so using it in route callback won't work
	// http://stackoverflow.com/questions/6837543/show-virtual-keyboard-on-mobile-phones-in-javascript
	$( '#searchInput' ).on( M.tapEvent( 'touchend mouseup' ), function() {
		new SearchOverlay().show();
		// without this delay, the keyboard will not show up on Android...
		// (tested in Chrome for Android)
		setTimeout( function() {
			M.router.navigate( '/search' );
		}, 300 );
	} );

	// FIXME: ugly hack that removes search from browser history when navigating
	// to search results (we can't rely on History API yet)
	// alpha does it differently in lazyload.js
	if ( !M.isAlphaGroupMember() && !M.isApp() ) {
		M.on( 'search-results', function( overlay ) {
			overlay.$( '.results a' ).on( 'click', function() {
				var href = $( this ).attr( 'href' );
				M.router.back();

				// give browser a few ms after M.router.back() to update its history
				// and then redirect
				setTimeout( function() {
					window.location.href = href;
				}, 10 );
				// Prevent the link from working and prevent the closing of the overlay
				// by an event upstream which would trigger browser back on the clicked link
				return false;
			} );
		} );
	}

}( mw.mobileFrontend, jQuery ));
