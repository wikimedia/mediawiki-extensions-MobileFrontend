/*global mw, document, window */
/*jslint sloppy: true, white:true, maxerr: 50, indent: 4, plusplus: true*/
( function( M ) {

M.history = ( function() {

	return {
		replaceHash: function( newHash ) {
			var hashChanged = newHash != window.location.hash;
			if ( window.history && window.history.replaceState && hashChanged ) {
				window.history.replaceState( null, null, newHash );
			} else if ( hashChanged ){
				window.location.hash = newHash;
			}
		},
		pushState: function( hash ) {
			var hashChanged = hash != window.location.hash;
			if ( window.history && window.history.pushState && hashChanged ) {
				window.history.pushState( null, null, hash );
			} else if ( hashChanged ) {
				window.location.hash = hash;
			}
		}
	};
}() );

} )( mw.mobileFrontend );
