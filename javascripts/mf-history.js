/*global mw, document, window */
/*jslint sloppy: true, white:true, maxerr: 50, indent: 4, plusplus: true*/
( function( M ) {

M.history = ( function() {
	var initialised = false;

	if ( typeof $ !== 'undefined' ) {
		$( window ).bind( 'hashchange', function() {
			var curPage = { hash: window.location.hash };
			$( window ).trigger( 'mw-mf-history-change', [ curPage ] );
		} );
	}

	// ensures the history change event fires on initial load
	function initialise( hash ) {
		if ( !initialised && hash !== '#_' ) {
			initialised = true;
			$( window ).trigger( 'mw-mf-history-change', [ { hash: hash } ] );
		}
	}

	return {
		replaceHash: function( newHash ) {
			var hashChanged = newHash != window.location.hash;
			if ( window.history && window.history.replaceState && hashChanged ) {
				window.history.replaceState( null, null, newHash );
			} else if ( hashChanged ){
				window.location.hash = newHash;
			}
			initialise( newHash );
		},
		pushState: function( hash ) {
			var hashChanged = hash != window.location.hash;
			if ( window.history && window.history.pushState && hashChanged ) {
				window.history.pushState( null, null, hash );
			} else if ( hashChanged ) {
				window.location.hash = hash;
			}
			initialise( hash );
		}
	};
}() );

} )( mw.mobileFrontend );
