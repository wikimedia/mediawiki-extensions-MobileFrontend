( function ( M, $ ) {
	var searchPlaceholderMsg = 'mobile-frontend-placeholder',
		SchemaMobileWebClickTracking = M.require( 'mobile.loggingSchemas/SchemaMobileWebClickTracking' ),
		uiSchema = new SchemaMobileWebClickTracking( {}, 'MobileWebUIClickTracking' ),
		context = M.require( 'mobile.context/context' ),
		router = M.require( 'mobile.startup/router' ),
		browser = M.require( 'mobile.browser/browser' ),
		moduleConfig = {
			modules: [ 'mobile.search.api', 'mobile.search' ],
			api: 'mobile.search.api/SearchApi',
			overlay: 'mobile.search/SearchOverlay'
		},
		SearchOverlay,
		SearchApi;

	if ( context.isBetaGroupMember() ) {
		moduleConfig = $.extend( moduleConfig, {
			modules: [ 'mobile.search.beta.api', 'mobile.search.beta' ],
			api: 'mobile.search.beta.api/SearchApi'
		} );
	}

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
		uiSchema.log( {
			name: 'search'
		} );

		mw.loader.using( moduleConfig.modules ).done( function () {
			SearchApi = M.require( moduleConfig.api );
			SearchOverlay = M.require( moduleConfig.overlay );

			new SearchOverlay( {
				api: new SearchApi(),
				searchTerm: searchTerm,
				placeholderMsg: placeholder
			} ).show();
			router.navigate( '/search' );
		} );
	}

	// change the placeholder text for javascript enabled browsers
	if ( context.isAlphaGroupMember() ) {
		searchPlaceholderMsg = 'mobile-frontend-placeholder-alpha';
	} else if ( context.isBetaGroupMember() ) {
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
		// in alpha the search input is inside the main menu
		$( '#searchInput, #mw-mf-page-left input.search' ).on( 'click', openSearchOverlay )
			// FIXME: Review the need for this, especially given latest alpha developments
			// Apparently needed for main menu to work correctly.
			.prop( 'readonly', true );
	}

	M.require( 'mobile.search/MobileWebSearchLogger' ).register();

}( mw.mobileFrontend, jQuery ) );
