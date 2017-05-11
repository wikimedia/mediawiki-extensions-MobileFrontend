( function ( M, $ ) {
	var SearchOverlay = M.require( 'mobile.search/SearchOverlay' ),
		SearchGateway = M.require( 'mobile.search.api/SearchGateway' ),
		router = require( 'mediawiki.router' ),
		searchLogger = M.require( 'mobile.search/MobileWebSearchLogger' ),
		browser = M.require( 'mobile.startup/Browser' ).getSingleton();

	/**
	 * Reveal the search overlay
	 * @param {jQuery.Event} ev
	 * @event mobilefrontend.searchModule
	 * @ignore
	 */
	function openSearchOverlay( ev ) {
		var overlay,
			$this = $( this ),
			searchTerm = $this.val(),
			placeholder = $this.attr( 'placeholder' );

		ev.preventDefault();
		// The loading of SearchOverlay should never be done inside a callback
		// as this will result in issues with input focus
		// see https://phabricator.wikimedia.org/T156508#2977463
		overlay = new SearchOverlay( {
			router: router,
			gatewayClass: SearchGateway,
			api: new mw.Api(),
			searchTerm: searchTerm,
			placeholderMsg: placeholder
		} );
		searchLogger.register( overlay );
		overlay.show();
		router.navigate( '/search' );
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
		$( '#searchInput, #searchIcon' ).on( 'click', openSearchOverlay )
			// Apparently needed for main menu to work correctly.
			.prop( 'readonly', true );
	}

}( mw.mobileFrontend, jQuery ) );
