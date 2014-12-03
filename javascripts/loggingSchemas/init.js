// Add EventLogging to hamburger menu
( function ( M, $ ) {
	var MobileWebClickTracking = M.require( 'loggingSchemas/MobileWebClickTracking' );

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
		MobileWebClickTracking.hijackLink( '#mw-mf-page-left .icon-random',
			'hamburger-random' );
		MobileWebClickTracking.hijackLink( '#mw-mf-page-left .icon-nearby',
			'hamburger-nearby' );
		MobileWebClickTracking.hijackLink( '#mw-mf-page-left .icon-watchlist',
			'hamburger-watchlist' );
		MobileWebClickTracking.hijackLink( '#mw-mf-page-left .icon-settings',
			'hamburger-settings' );
		MobileWebClickTracking.hijackLink( '#mw-mf-page-left .icon-uploads',
			'hamburger-uploads' );
		MobileWebClickTracking.hijackLink( '#mw-mf-page-left .icon-profile',
			'hamburger-profile' );
		MobileWebClickTracking.hijackLink( '#mw-mf-page-left .icon-anon',
			'hamburger-login' );
		MobileWebClickTracking.hijackLink( '#mw-mf-page-left .icon-secondary-logout',
			'hamburger-logout' );
		MobileWebClickTracking.hijackLink( $( '#mw-mf-last-modified a span' ).parent(),
			'lastmodified-history' );
		MobileWebClickTracking.hijackLink( $profileLink, 'lastmodified-profile' );
		MobileWebClickTracking.hijackLink( '.nearby-button', 'nearby-button' );
	} );

	MobileWebClickTracking.logPastEvent();
} )( mw.mobileFrontend, jQuery );
