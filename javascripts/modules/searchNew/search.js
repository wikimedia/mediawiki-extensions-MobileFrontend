( function( M, $ ) {

	var SearchOverlay = M.require( 'modules/searchNew/SearchOverlay' );

	// FIXME change when micro.tap.js in stable
	// don't use focus event (https://bugzilla.wikimedia.org/show_bug.cgi?id=47499)
	$( '#searchInput' ).on( M.tapEvent( 'touchend mouseup' ), function() {
		M.router.navigate( 'search' );
	} );

	// FIXME: ugly hack that removes search from browser history when navigating
	// to search results (we can't rely on History API yet)
	// alpha does it differently in lazyload.js
	if ( mw.config.get( 'wgMFMode' ) !== 'alpha' ) {
		M.on( 'search-results', function( overlay ) {
			overlay.$( '.results a' ).on( 'click', function( ev ) {
				var href = $( this ).attr( 'href' );
				ev.preventDefault();
				window.history.back();

				// give browser a tick to update its history and redirect
				setTimeout( function() {
					window.location.href = href;
				}, 0 );
			} );
		} );
	}

	M.router.route( /^search$/, function() {
		new SearchOverlay().show();
	} );

}( mw.mobileFrontend, jQuery ));
