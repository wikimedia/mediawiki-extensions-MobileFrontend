( function ( M, $ ) {
	var SearchOverlay, SearchGateway,
		router = require( 'mediawiki.router' ),
		browser = M.require( 'mobile.browser/Browser' ).getSingleton();

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

		mw.loader.using( [ 'mobile.search.api', 'mobile.search' ] ).done( function () {
			SearchGateway = M.require( 'mobile.search.api/SearchGateway' );
			SearchOverlay = M.require( 'mobile.search/SearchOverlay' );

			new SearchOverlay( {
				router: router,
				gatewayClass: SearchGateway,
				api: new mw.Api(),
				searchTerm: searchTerm,
				placeholderMsg: placeholder
			} ).show();
			router.navigate( '/search' );
		} );
	}

	// Only continue on mobile devices as it breaks desktop search
	// See https://phabricator.wikimedia.org/T108432
	if ( mw.config.get( 'skin' ) !== 'minerva' ) {
		return;
	}

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
