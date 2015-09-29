( function ( M, $ ) {
	var BackToTopOverlay = M.require( 'mobile.backtotop/BackToTopOverlay' ),
		backtotop = new BackToTopOverlay();

	// initialize the back to top element
	backtotop.appendTo( 'body' );

	$( window ).on( 'scroll', $.debounce( 100, function () {
		if ( $( window ).height() - $( window ).scrollTop() <= 0 ) {
			backtotop.show();
		} else {
			backtotop.hide();
		}
	} ) );
}( mw.mobileFrontend, jQuery ) );
