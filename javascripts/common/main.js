/*global document, window, mw */
/*jslint sloppy: true, white:true, maxerr: 50, indent: 4, plusplus: true, sub:true */
document.documentElement.className += ' jsEnabled page-loading';

( function() {
var domLoaded;

if ( document.addEventListener ) {
	document.addEventListener( 'DOMContentLoaded', function() {
		domLoaded = true;
		_mwLogEvent( 'DOMContentLoaded' );
		mw.mobileFrontend.init();
	} );
}

window.onload = function() {
	if ( !domLoaded ) {
		mw.mobileFrontend.init();
	}
};

}() );
