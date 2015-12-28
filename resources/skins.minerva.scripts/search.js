( function ( M, $ ) {
	var SearchOverlay, SearchGateway,
		searchPlaceholderMsg = 'mobile-frontend-placeholder',
		context = M.require( 'mobile.context/context' ),
		router = M.require( 'mobile.startup/router' ),
		browser = M.require( 'mobile.browser/browser' ),
		moduleConfig = {
			modules: [ 'mobile.search.api', 'mobile.search' ],
			api: 'mobile.search.api/SearchGateway',
			overlay: 'mobile.search/SearchOverlay'
		};

	/**
	 * Reveal the search overlay
	 * @param {jQuery.Event} ev
	 * @event mobilefrontend.searchModule
	 * @ignore
	 */
	function openSearchOverlay( ev ) {
		var $this = $( this ),
			searchTerm = $this.val(),
			placeholder = $this.attr( 'placeholder' );

		ev.preventDefault();

		mw.loader.using( moduleConfig.modules ).done( function () {
			SearchGateway = M.require( moduleConfig.api );
			SearchOverlay = M.require( moduleConfig.overlay );

			new SearchOverlay( {
				gatewayClass: SearchGateway,
				api: new mw.Api(),
				searchTerm: searchTerm,
				placeholderMsg: placeholder
			} ).show();
			router.navigate( '/search' );
		} );
	}

	// change the placeholder text for javascript enabled browsers
	if ( context.isBetaGroupMember() ) {
		searchPlaceholderMsg = 'mobile-frontend-placeholder-beta';
	}

	$( '#searchInput' ).attr( 'placeholder', mw.message( searchPlaceholderMsg ) );

	// See https://phabricator.wikimedia.org/T76882 for why we disable search on Android 2
	if ( browser.isAndroid2() ) {
		$( 'body' ).addClass( 'client-use-basic-search' );
	} else {
		// don't use focus event (https://bugzilla.wikimedia.org/show_bug.cgi?id=47499)
		//
		// focus() (see SearchOverlay#show) opens virtual keyboard only if triggered
		// from user context event, so using it in route callback won't work
		// http://stackoverflow.com/questions/6837543/show-virtual-keyboard-on-mobile-phones-in-javascript
		$( '#searchInput' ).on( 'click', openSearchOverlay )
			// Apparently needed for main menu to work correctly.
			.prop( 'readonly', true );
	}

	M.require( 'mobile.search/MobileWebSearchLogger' ).register();

}( mw.mobileFrontend, jQuery ) );
