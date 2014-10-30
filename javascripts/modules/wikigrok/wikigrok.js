// Determine whether or not it is appropriate to load WikiGrok, and if so, load it.
( function ( M, $ ) {
	var wikidataID = mw.config.get( 'wgWikibaseItemId' ),
		permittedOnThisDevice = mw.config.get( 'wgMFEnableWikiGrokOnAllDevices' ) || !M.isWideScreen(),
		idOverride,
		versions = {
			A: {
				module: 'mobile.wikigrok.dialog',
				view: 'modules/wikigrok/WikiGrokDialog'
			},
			B: {
				module: 'mobile.wikigrok.dialog.b',
				view: 'modules/wikigrok/WikiGrokDialogB'
			}
		},
		version;

	/*
	 * Gets the version of wikigrok to use.
	 *
	 * If logged in:
	 *   * If Alpha, use B
	 *   * Otherwise use A
	 * If anonymous:
	 *   * If it had any particular version assigned, use that one.
	 *   * Else, assign randomly a wikigrok version to use.
	 * @return {Object}
	 */
	function getWikiGrokVersion() {
		var cookieName = mw.config.get( 'wgCookiePrefix' ) + '-wikiGrokAnonymousVersion',
			anonVersion = $.cookie( cookieName );

		if ( !mw.user.isAnon() ) {
			if ( M.isAlphaGroupMember() ) {
				return versions.B;
			} else {
				return versions.A;
			}
		} else {
			if ( anonVersion ) {
				return versions[anonVersion];
			} else {
				anonVersion = Math.round( Math.random() ) ? 'A' : 'B';
				$.cookie( cookieName, anonVersion, {
					expires: 90, // (days)
					path: '/'
				} );
				return versions[anonVersion];
			}
		}
	}

	/*
	 * Gets the user's token from 'cookie prefix' + "-wikiGrokUserToken"
	 * cookie. If the cookie isn't set, then a token is generated,
	 * stored in the cookie for 90 days, and then returned.
	 *
	 * @return {string}
	 */
	function getUserToken() {
		var cookieName = mw.config.get( 'wgCookiePrefix' ) + '-wikiGrokUserToken',
			storedToken = $.cookie( cookieName ),
			generatedToken;

		if ( storedToken ) {
			return storedToken;
		}

		generatedToken = mw.user.generateRandomSessionId();

		$.cookie( cookieName, generatedToken, {
			expires: 90, // (days)
			path: '/'
		} );

		return generatedToken;
	}

	// Allow query string override for testing, for example, '?wikidataid=Q508703'
	if ( !wikidataID ) {
		idOverride = window.location.search.match( /wikidataid=([^&]*)/ );
		if ( idOverride ) {
			mw.config.set( 'wgWikibaseItemId', idOverride[1] );
			wikidataID = idOverride[1];
			// Reset opt out
			localStorage.removeItem( 'mfHideWikiGrok' );
		}
	}

	// Only run in alpha mode
	M.assertMode( [ 'beta', 'alpha' ] );

	if (
		// WikiGrok is enabled
		mw.config.get( 'wgMFEnableWikiGrok' ) &&
		// We're not on the Main Page
		!mw.config.get( 'wgIsMainPage' ) &&
		// Permitted on this device
		permittedOnThisDevice &&
		// We're in 'view' mode
		mw.config.get( 'wgAction' ) === 'view' &&
		// Wikibase is active and this page has an item ID
		wikidataID &&
		// We're in Main namespace,
		mw.config.get( 'wgNamespaceNumber' ) === 0 &&
		// The user has not opted out of WikiGrok previously
		M.supportsLocalStorage &&
		!localStorage.getItem( 'mfHideWikiGrok' )
	) {

		// Load the required module and view based on the version for the user
		version = getWikiGrokVersion();
		mw.loader.using( version.module ).done( function () {
			var WikiGrokDialog = M.require( version.view );

			// See if there are potential occupation claims about this person so we can decide if
			// it's appropriate to display the WikiGrok interface.
			function init() {
				var dialog = new WikiGrokDialog( { itemId: wikidataID,
						title: mw.config.get( 'wgTitle' ),
						userToken: getUserToken(),
						testing: ( idOverride ) ? true : false } );

				if ( $( '.toc-mobile' ).length ) {
					dialog.insertBefore( '.toc-mobile' );
				} else {
					dialog.appendTo( M.getLeadSection() );
				}
			}

			init();
		} );

		// Make OverlayManager handle '#/wikigrok/about' links.
		M.overlayManager.add( /^\/wikigrok\/about$/, function () {
			var d = $.Deferred();
			mw.loader.using( 'mobile.wikigrok.dialog' ).done( function () {
				var WikiGrokMoreInfo = M.require( 'modules/wikigrok/WikiGrokMoreInfo' );
				d.resolve( new WikiGrokMoreInfo() );
			} );
			return d;
		} );
	}
}( mw.mobileFrontend, jQuery ) );
