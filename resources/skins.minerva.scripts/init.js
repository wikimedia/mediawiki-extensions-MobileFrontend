( function ( M, $ ) {
	var inSample, inStable, experiment,
		settings = M.require( 'mobile.settings/settings' ),
		time = M.require( 'mobile.modifiedBar/time' ),
		token = settings.get( 'mobile-betaoptin-token' ),
		BetaOptinPanel = M.require( 'mobile.betaoptin/BetaOptinPanel' ),
		loader = M.require( 'mobile.overlays/moduleLoader' ),
		router = M.require( 'mobile.startup/router' ),
		context = M.require( 'mobile.context/context' ),
		cleanuptemplates = M.require( 'mobile.issues/cleanuptemplates' ),
		useNewMediaViewer = context.isBetaGroupMember(),
		overlayManager = M.require( 'mobile.startup/overlayManager' ),
		page = M.getCurrentPage(),
		thumbs = page.getThumbnails(),
		experiments = mw.config.get( 'wgMFExperiments' ) || {},
		betaOptinPanel;

	/**
	 * Event handler for clicking on an image thumbnail
	 * @param {jQuery.Event} ev
	 * @ignore
	 */
	function onClickImage( ev ) {
		ev.preventDefault();
		router.navigate( '#/media/' + encodeURIComponent( $( this ).data( 'thumb' ).getFileName() ) );
	}

	/**
	 * Add routes to images and handle clicks
	 * @method
	 * @ignore
	 */
	function initMediaViewer() {
		if ( !mw.config.get( 'wgImagesDisabled' ) ) {
			$.each( thumbs, function ( i, thumb ) {
				thumb.$el.off().data( 'thumb', thumb ).on( 'click', onClickImage );
			} );
		}
	}

	/**
	 * Hijack the Special:Languages link and replace it with a trigger to a LanguageOverlay
	 * that displays the same data
	 * @ignore
	 */
	function initButton() {
		// FIXME: remove .languageSelector when cache clears
		var $languageSwitcherBtn = $( '#language-switcher, .languageSelector' ),
			languageButtonVersion = ( !page.isMainPage() && context.isBetaGroupMember() ) ?
				'top-of-article' : 'bottom-of-article';

		/**
		 * Log impression when the language button is seen by the user
		 * @ignore
		 */
		function logLanguageButtonImpression() {
			if ( mw.viewport.isElementInViewport( $languageSwitcherBtn[0] ) ) {
				M.off( 'scroll', logLanguageButtonImpression );

				mw.track( 'mf.schemaMobileWebLanguageSwitcher', {
					event: 'languageButtonImpression'
				} );
			}
		}

		/**
		 * Return the number of times the user has clicked on the language button
		 *
		 * @ignore
		 * @param {Number} tapCount
		 * @return {String}
		 */
		function getLanguageButtonTappedBucket( tapCount ) {
			var bucket;

			if ( tapCount === 0 ) {
				bucket = '0';
			} else if ( tapCount >= 1 && tapCount <= 4 ) {
				bucket = '1-4';
			} else if ( tapCount >= 5 && tapCount <= 20 ) {
				bucket = '5-20';
			} else if ( tapCount > 20 ) {
				bucket = '20+';
			}
			bucket += ' taps';
			return bucket;
		}

		if ( $languageSwitcherBtn.length ) {
			mw.track( 'mf.schemaMobileWebLanguageSwitcher', {
				event: 'pageLoaded',
				beaconCapable: $.isFunction( navigator.sendBeacon )
			} );

			M.on( 'scroll', logLanguageButtonImpression );
			// maybe the button is already visible?
			logLanguageButtonImpression();

			$languageSwitcherBtn.on( 'click', function ( ev ) {
				var previousTapCount = settings.get( 'mobile-language-button-tap-count' ),
					$languageLink = context.isBetaGroupMember() ? $languageSwitcherBtn.find( 'a' ) : $languageSwitcherBtn,
					tapCountBucket;

				ev.preventDefault();

				// In beta the icon is still shown even though there are no languages to show.
				// Only show the overlay if the page has other languages.
				if ( $languageLink.attr( 'href' ) ) {
					router.navigate( '/languages' );
				}

				// when local storage is not available ...
				if ( previousTapCount === false ) {
					previousTapCount = 0;
					tapCountBucket = 'unknown';
				// ... or when the key has not been previously saved
				} else if ( previousTapCount === null ) {
					previousTapCount = 0;
					tapCountBucket = getLanguageButtonTappedBucket( previousTapCount );
				} else {
					previousTapCount = parseInt( previousTapCount, 10 );
					tapCountBucket = getLanguageButtonTappedBucket( previousTapCount );
				}

				settings.save( 'mobile-language-button-tap-count', previousTapCount + 1 );
				mw.track( 'mf.schemaMobileWebLanguageSwitcher', {
					event: 'languageButtonTap',
					languageButtonVersion: languageButtonVersion,
					languageButtonTappedBucket: tapCountBucket,
					primaryLanguageOfUser: getDeviceLanguage() || 'unknown'
				} );
			} );
		}
	}

	/**
	 * Return the language code of the device in lowercase
	 *
	 * @ignore
	 * @returns {String|undefined}
	 */
	function getDeviceLanguage() {
		var lang = navigator && navigator.languages ?
			navigator.languages[0] :
			navigator.language || navigator.userLanguage ||
				navigator.browserLanguage || navigator.systemLanguage;

		return lang ? lang.toLowerCase() : undefined;
	}

	/**
	 * Load image overlay
	 * @method
	 * @ignore
	 * @uses ImageOverlay
	 * @param {String} title Url of image
	 * @returns {jQuery.Deferred}
	 */
	function loadImageOverlay( title ) {
		var result = $.Deferred(),
			rlModuleName = useNewMediaViewer ? 'mobile.mediaViewer.beta' : 'mobile.mediaViewer',
			moduleName = useNewMediaViewer ? 'ImageOverlayBeta' : 'ImageOverlay';

		loader.loadModule( rlModuleName ).done( function () {
			var ImageOverlay = M.require( rlModuleName + '/' + moduleName );

			result.resolve(
				new ImageOverlay( {
					api: new mw.Api(),
					thumbnails: thumbs,
					title: decodeURIComponent( title )
				} )
			);
		} );
		return result;
	}

	// Routes
	overlayManager.add( /^\/media\/(.+)$/, loadImageOverlay );
	overlayManager.add( /^\/languages$/, function () {
		var result = $.Deferred();

		loader.loadModule( 'mobile.languages.structured', true ).done( function ( loadingOverlay ) {
			var PageGateway = M.require( 'mobile.startup/PageGateway' ),
				gateway = new PageGateway( new mw.Api() ),
				LanguageOverlay = M.require( 'mobile.languages.structured/LanguageOverlay' );

			gateway.getPageLanguages( mw.config.get( 'wgPageName' ) ).done( function ( data ) {
				loadingOverlay.hide();
				result.resolve( new LanguageOverlay( {
					currentLanguage: mw.config.get( 'wgContentLanguage' ),
					languages: data.languages,
					variants: data.variants,
					deviceLanguage: getDeviceLanguage()
				} ) );
			} );
		} );
		return result;
	} );

	// for Special:Uploads
	M.on( 'photo-loaded', initMediaViewer );

	// Setup
	$( function () {
		initButton();
		initMediaViewer();
	} );

	// Access the beta optin experiment if available.
	experiment = experiments.betaoptin || false;
	// local storage is supported in this case, when ~ means it was dismissed
	if ( experiment && token !== false && token !== '~' && !page.isMainPage() && !page.inNamespace( 'special' ) ) {
		if ( !token ) {
			token = mw.user.generateRandomSessionId();
			settings.save( 'mobile-betaoptin-token', token );
		}

		inStable = !context.isBetaGroupMember();
		inSample = mw.experiments.getBucket( experiment, token ) === 'A';
		if ( inStable && ( inSample || mw.util.getParamValue( 'debug' ) ) ) {
			betaOptinPanel = new BetaOptinPanel( {
				postUrl: mw.util.getUrl( 'Special:MobileOptions', {
					returnto: page.title
				} )
			} )
				.on( 'hide', function () {
					settings.save( 'mobile-betaoptin-token', '~' );
				} )
				.appendTo( M.getCurrentPage().getLeadSectionElement() );
		}
	}

	// Setup the issues banner on the page
	cleanuptemplates.init();
	// Show it in edit preview.
	M.on( 'edit-preview', function ( overlay ) {
		cleanuptemplates.init( overlay.$el );
	} );

	// let the interested parties know whether the panel is shown
	mw.track( 'minerva.betaoptin', {
		isPanelShown: betaOptinPanel !== undefined
	} );

	/**
	 * Initialisation function for last modified module.
	 *
	 * Enhances an element representing a time
	 * to show a human friendly date in seconds, minutes, hours, days
	 * months or years
	 * @ignore
	 * @param {JQuery.Object} [$lastModifiedLink]
	 */
	function initHistoryLink( $lastModifiedLink ) {
		var delta, historyUrl, msg,
			ts, username, gender;

		historyUrl = $lastModifiedLink.attr( 'href' );
		ts = $lastModifiedLink.data( 'timestamp' );
		username = $lastModifiedLink.data( 'user-name' ) || false;
		gender = $lastModifiedLink.data( 'user-gender' );

		if ( ts ) {
			delta = time.getTimeAgoDelta( parseInt( ts, 10 ) );
			if ( time.isRecent( delta ) ) {
				$lastModifiedLink.closest( '.last-modified-bar' ).addClass( 'active' );
			}
			msg = time.getLastModifiedMessage( ts, username, gender, historyUrl );
			$lastModifiedLink.replaceWith( msg );
		}
	}

	/**
	 * Initialisation function for last modified times
	 *
	 * Enhances .modified-enhancement element
	 * to show a human friendly date in seconds, minutes, hours, days
	 * months or years
	 * @ignore
	 */
	function initModifiedInfo() {
		$( '.modified-enhancement' ).each( function () {
			initHistoryLink( $( this ) );
		} );
	}

	$( function () {
		// Update anything else that needs enhancing (e.g. watchlist)
		initModifiedInfo();
		initHistoryLink( $( '#mw-mf-last-modified a' ) );
	} );
}( mw.mobileFrontend, jQuery ) );
