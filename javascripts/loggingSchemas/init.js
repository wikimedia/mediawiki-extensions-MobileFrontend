// Add EventLogging to hamburger menu
( function ( M, $ ) {
	var SchemaMobileWebClickTracking = M.require( 'loggingSchemas/SchemaMobileWebClickTracking' ),
		mainMenuSchema = new SchemaMobileWebClickTracking( {}, 'MobileWebMainMenuClickTracking' ),
		uiSchema = new SchemaMobileWebClickTracking( {}, 'MobileWebUIClickTracking' );

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
			uiSchema.log( {
				name: 'hamburger'
			} );
		} );

		mainMenuSchema.hijackLink( '.icon-home', 'home' );
		mainMenuSchema.hijackLink( mainMenuIconSelector( 'random' ), 'random' );
		mainMenuSchema.hijackLink( mainMenuIconSelector( 'nearby' ), 'nearby' );
		mainMenuSchema.hijackLink( mainMenuIconSelector( 'watchlist' ), 'watchlist' );
		mainMenuSchema.hijackLink( mainMenuIconSelector( 'settings' ), 'settings' );
		mainMenuSchema.hijackLink( mainMenuIconSelector( 'uploads' ), 'uploads' );
		mainMenuSchema.hijackLink( mainMenuIconSelector( 'profile' ), 'profile' );
		mainMenuSchema.hijackLink( mainMenuIconSelector( 'anon' ), 'login' );
		mainMenuSchema.hijackLink( mainMenuIconSelector( 'secondary-logout' ), 'logout' );
		uiSchema.hijackLink( $( '#mw-mf-last-modified a span' ).parent(), 'lastmodified-history' );
		uiSchema.hijackLink( $profileLink, 'lastmodified-profile' );
		uiSchema.hijackLink( '.nearby-button', 'nearby-button' );
	} );
} )( mw.mobileFrontend, jQuery );
