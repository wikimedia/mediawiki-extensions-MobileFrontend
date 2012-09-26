// hijack the link on desktop site to mobile view and unset stopMobileRedirect cookie
( function( $ ) {
	$( '.stopMobileRedirectToggle' ).click( function() {
		var hostname = mw.config.get( 'wgMFStopRedirectCookieHost' ),
			path = mw.config.get( 'wgCookiePath' );

		$.cookie( 'stopMobileRedirect', null, { path: path, domain: hostname } );
	});
} )( jQuery );
