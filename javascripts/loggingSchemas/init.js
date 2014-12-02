// Add EventLogging to hamburger menu
( function ( M, $ ) {
	var MobileWebClickTracking = M.require( 'loggingSchemas/MobileWebClickTracking' );

	/**
	 * Get the icon selector for the given main menu element (depending on alpha/stable mode)
	 * @param {String} name Name of the main menu element
	 * @return {String} Complete selector
	 */
	function mainMenuIconSelector( name ) {
		// FIXME: Remove when mw-ui-icon is in stable
		if ( !M.isAlphaGroupMember() ) {
			return '#mw-mf-page-left .icon-' + name;
		} else {
			return '#mw-mf-page-left .mw-ui-icon-' + name;
		}
	}

	$( function () {
		var $profileLink = $( '#mw-mf-last-modified a' )
			.filter( function () {
				return $( this ).children().length === 0;
			} );

		$( '#mw-mf-main-menu-button' ).on( 'click', function () {
			MobileWebClickTracking.log( 'hamburger' );
		} );

		MobileWebClickTracking.hijackLink( '.icon-home',
			'hamburger-home' );
		MobileWebClickTracking.hijackLink( mainMenuIconSelector( 'random' ),
			'hamburger-random' );
		MobileWebClickTracking.hijackLink( mainMenuIconSelector( 'nearby' ),
			'hamburger-nearby' );
		MobileWebClickTracking.hijackLink( mainMenuIconSelector( 'watchlist' ),
			'hamburger-watchlist' );
		MobileWebClickTracking.hijackLink( mainMenuIconSelector( 'settings' ),
			'hamburger-settings' );
		MobileWebClickTracking.hijackLink( mainMenuIconSelector( 'uploads' ),
			'hamburger-uploads' );
		MobileWebClickTracking.hijackLink( mainMenuIconSelector( 'profile' ),
			'hamburger-profile' );
		MobileWebClickTracking.hijackLink( mainMenuIconSelector( 'anon' ),
			'hamburger-login' );
		MobileWebClickTracking.hijackLink( mainMenuIconSelector( 'secondary-logout' ),
			'hamburger-logout' );
		MobileWebClickTracking.hijackLink( $( '#mw-mf-last-modified a span' ).parent(),
			'lastmodified-history' );
		MobileWebClickTracking.hijackLink( $profileLink, 'lastmodified-profile' );
		MobileWebClickTracking.hijackLink( '.nearby-button', 'nearby-button' );
	} );

	MobileWebClickTracking.logPastEvent();
} )( mw.mobileFrontend, jQuery );
