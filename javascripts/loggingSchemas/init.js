// Add EventLogging to hamburger menu
( function ( M, $ ) {
	var MobileWebClickTracking = M.require( 'loggingSchemas/MobileWebClickTracking' );

	/**
	 * Get the icon selector for the given main menu element (depending on alpha/stable mode)
	 * @ignore
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
			MobileWebClickTracking.log( 'UI', 'hamburger' );
		} );

		MobileWebClickTracking.hijackLink( 'MainMenu', '.icon-home',
			'home' );
		MobileWebClickTracking.hijackLink( 'MainMenu', mainMenuIconSelector( 'random' ),
			'random' );
		MobileWebClickTracking.hijackLink( 'MainMenu', mainMenuIconSelector( 'nearby' ),
			'nearby' );
		MobileWebClickTracking.hijackLink( 'MainMenu', mainMenuIconSelector( 'watchlist' ),
			'watchlist' );
		MobileWebClickTracking.hijackLink( 'MainMenu', mainMenuIconSelector( 'settings' ),
			'settings' );
		MobileWebClickTracking.hijackLink( 'MainMenu', mainMenuIconSelector( 'uploads' ),
			'uploads' );
		MobileWebClickTracking.hijackLink( 'MainMenu', mainMenuIconSelector( 'profile' ),
			'profile' );
		MobileWebClickTracking.hijackLink( 'MainMenu', mainMenuIconSelector( 'anon' ),
			'login' );
		MobileWebClickTracking.hijackLink( 'MainMenu', mainMenuIconSelector( 'secondary-logout' ),
			'logout' );
		MobileWebClickTracking.hijackLink( 'UI', $( '#mw-mf-last-modified a span' ).parent(),
			'lastmodified-history' );
		MobileWebClickTracking.hijackLink( 'UI', $profileLink, 'lastmodified-profile' );
		MobileWebClickTracking.hijackLink( 'UI', '.nearby-button', 'nearby-button' );
		MobileWebClickTracking.hijackLink( 'UI', '.fontchanger.link', 'fontchanger-menu' );
		MobileWebClickTracking.hijackLink( 'UI', '.fontchanger-size1', 'fontchanger-size1' );
		MobileWebClickTracking.hijackLink( 'UI', '.fontchanger-size2', 'fontchanger-size2' );
		MobileWebClickTracking.hijackLink( 'UI', '.fontchanger-size3', 'fontchanger-size3' );
	} );

	MobileWebClickTracking.logPastEvent();
} )( mw.mobileFrontend, jQuery );
