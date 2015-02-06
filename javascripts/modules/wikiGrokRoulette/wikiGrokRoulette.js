( function ( M, $ ) {
	var api = M.require( 'api' ),
		util = M.require( 'util' ),
		query = $.extend( {}, util.query ),
		LoadingOverlay = M.require( 'LoadingOverlay' ),
		ErrorDrawer = M.require( 'modules/wikiGrokRoulette/ErrorDrawer' ),
		nextPage,
		wikiGrokRoulette;

	/**
	 * Load and navigate to the next page
	 * @class modules/wikiGrokRoulette/wikiGrokRoulette
	 * @singleton
	 * @uses LoadingOverlay
	 * @uses modules/wikiGrokRoulette/ErrorDrawer
	 */
	wikiGrokRoulette = {
		/**
		 * Get the next page and cache it
		 * Valid response from the server is transformed to the following form:
		 * { url: 'page url', title: 'page title'}
		 * @return {jQuery.Deferred}
		 */
		getNextPage: function () {
			var result;

			if ( nextPage ) {
				result = $.Deferred().resolve( nextPage );
			} else {
				result = api.ajax( {
					action: 'query',
					list: 'wikigrokrandom',
					categories: this.categories
				} ).then( function ( response ) {
					if ( response.query &&
						response.query.wikigrokrandom &&
						response.query.wikigrokrandom.length > 0
					) {
						// Remove title from query because it's already used in constructing the URL.
						// Leave everything else unchanged for testing purposes.
						delete query.title;
						nextPage = {
							url: mw.util.getUrl(
								response.query.wikigrokrandom[0].title,
								query
							) + '#wikigrokversion=c',
							title: response.query.wikigrokrandom[0].title
						};
						return nextPage;
					}
				} );
			}

			return result;
		},

		/**
		 * Navigate to the next page
		 */
		navigateToNextPage: function () {
			var loadingOverlay = new LoadingOverlay();

			loadingOverlay.show();

			this.getNextPage().done( function ( page ) {
				if ( page && page.url && page.title ) {
					// navigated to the url
					window.location.href = page.url;
					// FIXME: expose wikigrok/init.js so that we can just show wikigrok without reloading in such cases
					// force reload if page titles match
					if ( M.getCurrentPage().title === page.title ) {
						window.location.reload();
					}
				} else {
					loadingOverlay.hide( false );
					new ErrorDrawer();
				}
			} ).fail( function () {
				loadingOverlay.hide( false );
				new ErrorDrawer();
			} ).always( function () {
				// FIXME: this module should not care about mainMenu. move this to init.js
				var mainMenu = M.require( 'skin' ).getMainMenu();
				mainMenu.closeNavigationDrawers();
			} );
		}
	};

	M.define( 'modules/wikiGrokRoulette/wikiGrokRoulette', wikiGrokRoulette );

}( mw.mobileFrontend, jQuery ) );
