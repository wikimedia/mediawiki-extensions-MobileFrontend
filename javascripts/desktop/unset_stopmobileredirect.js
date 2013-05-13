// hijack the link on desktop site to mobile view and unset stopMobileRedirect cookie
( function( $ ) {
	var cookie = mw.config.get( 'wgStopMobileRedirectCookie' );
	if ( cookie ) {
		$( '.stopMobileRedirectToggle' ).click( function() {
			$.cookie( cookie.name, null, { path: cookie.path, domain: cookie.domain } );
		} );
	}
} )( jQuery );
