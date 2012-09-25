/*global mw, document, window */
/*jslint sloppy: true, white:true, maxerr: 50, indent: 4, plusplus: true*/
( function( M ) {

M.history = ( function() {

	return {
		replaceHash: function( newHash ) {
			if( window.history && window.history.replaceState ) {
				window.history.replaceState( null, null, newHash );
			} else {
				window.location.hash = newHash;
			}
		},
		pushState: function( hash ) {
			if( window.history && window.history.pushState ) {
				window.history.pushState( null, null, hash );
			} else {
				window.location.hash = hash;
			}
		}
	};
}() );

} )( mw.mobileFrontend );
