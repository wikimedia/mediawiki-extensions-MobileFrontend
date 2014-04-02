( function( M, $ ) {
	var s = M.settings, name, href;

	function log( name, destination ) {
		var
			user = M.require( 'user' ),
			username = user.getName(),
			data = {
				name: name,
				destination: destination,
				mobileMode: mw.config.get( 'wgMFMode' )
			};

		if ( username ) {
			data.username = username;
			data.userEditCount = mw.config.get( 'wgUserEditCount' );
		}
		return M.log( 'MobileWebClickTracking', data );
	}
	function futureLog( name, href ) {
		s.saveUserSetting( 'MobileWebClickTracking-name', name );
		s.saveUserSetting( 'MobileWebClickTracking-href', href );
	}

	function hijackLink( selector, name ) {
		$( selector ).on( M.tapEvent( 'click' ), function() {
			futureLog( name, $( this ).attr( 'href' ) );
		} );
	}

	// Deal with events requested on the preview page
	name = s.getUserSetting( 'MobileWebClickTracking-name' );
	href = s.getUserSetting( 'MobileWebClickTracking-href' );
	// Make sure they do not log a second time...
	if ( name && href ) {
		s.saveUserSetting( 'MobileWebClickTracking-name', '' );
		s.saveUserSetting( 'MobileWebClickTracking-href', '' );
		// Since MobileWebEditing schema declares the dependencies to
		// EventLogging and the schema we can be confident this will always log.
		log( name, href );
	}

	M.define( 'loggingSchemas/MobileWebClickTracking', {
		log: log,
		hijackLink: hijackLink
	} );

	// Add EventLogging to hamburger menu
	$( function() {
		var $profileLink;
		if ( !M.isApp() ) {
			$profileLink = $( '#mw-mf-last-modified a' ).
				filter( function(){
					return $( this ).children().length === 0;
				} );

			hijackLink( '#mw-mf-page-left .icon-home a', 'hamburger-home' );
			hijackLink( '#mw-mf-page-left .icon-random a', 'hamburger-random' );
			hijackLink( '#mw-mf-page-left .icon-nearby a', 'hamburger-nearby' );
			hijackLink( '#mw-mf-page-left .icon-watchlist a', 'hamburger-watchlist' );
			hijackLink( '#mw-mf-page-left .icon-settings a', 'hamburger-settings' );
			hijackLink( '#mw-mf-page-left .icon-uploads a', 'hamburger-uploads' );
			hijackLink( '#mw-mf-page-left .icon-profile', 'hamburger-profile' );
			hijackLink( '#mw-mf-page-left .icon-anon a', 'hamburger-login' );
			hijackLink( '#mw-mf-page-left .icon-secondary-logout', 'hamburger-logout' );
			hijackLink( $( '#mw-mf-last-modified a span' ).parent(), 'lastmodified-history' );
			hijackLink( $profileLink, 'lastmodified-profile' );
		}
	} );
} )( mw.mobileFrontend, jQuery );
