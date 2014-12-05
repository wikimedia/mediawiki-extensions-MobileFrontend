// Determine whether or not it is appropriate to load WikiGrok, and if so, load it.
( function ( M, $ ) {
	var wikidataID = mw.config.get( 'wgWikibaseItemId' ),
		errorSchema = M.require( 'loggingSchemas/mobileWebWikiGrokError' ),
		settings = M.require( 'settings' ),
		permittedOnThisDevice = mw.config.get( 'wgMFEnableWikiGrokOnAllDevices' ) || !M.isWideScreen(),
		idOverride,
		versionConfigs = {
			A: {
				module: 'mobile.wikigrok.dialog',
				view: 'modules/wikigrok/WikiGrokDialog',
				name: 'a'
			},
			B: {
				module: 'mobile.wikigrok.dialog.b',
				view: 'modules/wikigrok/WikiGrokDialogB',
				name: 'b'
			}
		},
		versionConfig,
		WikiGrokAbTest = M.require( 'WikiGrokAbTest' ),
		wikiGrokUser = M.require( 'wikiGrokUser' );

	/*
	 * Checks whether the user has already seen and responded to a WikiGrok question
	 * before on this article and device.
	 */
	function hasUserAlreadyContributedToWikiGrok() {
		var pages = $.parseJSON(
				settings.get( 'pagesWithWikiGrokContributions', false ) || '{}'
			),
			result = false;

		if ( M.getCurrentPage().title in pages ) {
			result = true;
		}
		return result;
	}

	/*
	 * Gets the configuration for the version of WikiGrok to use.
	 *
	 * The `wikigrokversion` query parameter can be used to override this logic,
	 * `wikigrokversion=a` means that A will always be used. If the override
	 * version doesn't exist, then the default version (currently A) will be used.
	 *
	 * If the user is eligible to enter the WikiGrok AB test, then the test
	 * determines which version to use.
	 *
	 * @return {Object|null}
	 */
	function getWikiGrokConfig() {
		var versionOverride,
			versionConfig = null,
			wikiGrokAbTest = WikiGrokAbTest.newFromMwConfig();

		// See if there is a query string override
		if ( M.query.wikigrokversion ) {
			versionOverride = M.query.wikigrokversion.toUpperCase();

			if ( versionConfigs.hasOwnProperty( versionOverride ) ) {
				versionConfig = versionConfigs[versionOverride];
			}
		// Otherwise, see if A/B test is running, and if so, choose a version.
		} else if ( wikiGrokAbTest.isEnabled ) {
			versionConfig = versionConfigs[wikiGrokAbTest.getVersion( wikiGrokUser )];
		}

		return versionConfig;
	}

	versionConfig = getWikiGrokConfig();

	// Allow query string override for testing, for example, '?wikidataid=Q508703'
	if ( !wikidataID ) {
		idOverride = M.query.wikidataid;
		if ( idOverride ) {
			mw.config.set( 'wgWikibaseItemId', idOverride );
			wikidataID = idOverride;
		}
	}

	if (
		// User is not anonymous or we have enabled WikiGrok for anonymous users
		( !mw.user.isAnon() || mw.config.get( 'wgMFEnableWikiGrokForAnons' ) ) &&
		// User hasn't already contributed through WikiGrok on this page before or they
		// are testing WikiGrok (by using the query string override)
		( !hasUserAlreadyContributedToWikiGrok() || idOverride ) &&
		// WikiGrok is enabled and configured for this user
		versionConfig &&
		// We're not on the Main Page
		!mw.config.get( 'wgIsMainPage' ) &&
		// Permitted on this device
		permittedOnThisDevice &&
		// We're in 'view' mode
		mw.config.get( 'wgAction' ) === 'view' &&
		// Wikibase is active and this page has an item ID
		wikidataID &&
		// We're in Main namespace,
		mw.config.get( 'wgNamespaceNumber' ) === 0
	) {

		// Load the required module and view based on the version for the user
		mw.loader.using( versionConfig.module ).done( function () {
			var WikiGrokDialog = M.require( versionConfig.view ),
				page = M.getCurrentPage(),
				// Initialize the dialog and insert it into the page (but don't display yet)
				dialog = new WikiGrokDialog( {
					itemId: wikidataID,
					title: mw.config.get( 'wgTitle' ),
					userToken: wikiGrokUser.getToken(),
					testing: ( idOverride ) ? true : false
				} );

			// FIXME: If the table of contents code is not loaded the dialog will still
			//   get added to the end of the lead section.
			if ( $( '.toc-mobile' ).length ) {
				dialog.insertBefore( '.toc-mobile' );
			} else {
				dialog.appendTo( page.getLeadSectionElement() );
			}
		} ).fail( function () {
			var data = {
				error: 'no-impression-cannot-load-interface',
				taskType: 'version ' + versionConfig.name,
				taskToken: mw.user.generateRandomSessionId(),
				userToken: wikiGrokUser.getToken(),
				isLoggedIn: !wikiGrokUser.isAnon()
			};
			if ( idOverride ) {
				data.testing = true;
			}
			errorSchema.log( data );
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
