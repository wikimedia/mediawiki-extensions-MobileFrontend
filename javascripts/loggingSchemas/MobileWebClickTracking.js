( function( M, $ ) {

	function log( name, destination ) {
		return M.log( 'MobileWebClickTracking', {
			name: name,
			destination: destination,
			username: mw.config.get( 'wgUserName' ),
			userEditCount: parseInt( mw.config.get( 'wgUserEditCount' ), 10 ),
			mobileMode: mw.config.get( 'wgMFMode' )
		} );
	}

	function hijackLink( selector, name ) {
		function linkHandler( ev ) {
			ev.preventDefault();
			var href = $( this ).attr( 'href' );
			log( name, href ).always( function() {
				window.location.href = href;
			} );
		}
		$( selector ).on( M.tapEvent( 'click' ), linkHandler );
	}

	M.define( 'loggingSchemas/MobileWebClickTracking', {
		log: log,
		hijackLink: hijackLink
	} );

	// Add EventLogging to hamburger menu
	hijackLink( '#mw-mf-page-left .icon-home a', 'hamburger-home' );
	hijackLink( '#mw-mf-page-left .icon-random a', 'hamburger-random' );
	hijackLink( '#mw-mf-page-left .icon-nearby a', 'hamburger-nearby' );
	hijackLink( '#mw-mf-page-left .icon-watchlist a', 'hamburger-watchlist' );
	hijackLink( '#mw-mf-page-left .icon-settings a', 'hamburger-settings' );
	hijackLink( '#mw-mf-page-left .icon-uploads a', 'hamburger-uploads' );
	hijackLink( '#mw-mf-page-left .icon-profile a', 'hamburger-profile' );
	hijackLink( '#mw-mf-page-left .icon-logout a', 'hamburger-logout' );
} )( mw.mobileFrontend, jQuery );
