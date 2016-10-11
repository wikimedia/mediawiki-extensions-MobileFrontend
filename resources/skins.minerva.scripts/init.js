( function ( M, $ ) {
	var inSample, inStable, experiment,
		toast = M.require( 'mobile.toast/toast' ),
		settings = M.require( 'mobile.settings/settings' ),
		time = M.require( 'mobile.modifiedBar/time' ),
		token = settings.get( 'mobile-betaoptin-token' ),
		BetaOptinPanel = M.require( 'mobile.betaoptin/BetaOptinPanel' ),
		loader = M.require( 'mobile.overlays/moduleLoader' ),
		router = require( 'mediawiki.router' ),
		context = M.require( 'mobile.context/context' ),
		useNewMediaViewer = context.isBetaGroupMember(),
		overlayManager = M.require( 'skins.minerva.scripts/overlayManager' ),
		page = M.getCurrentPage(),
		thumbs = page.getThumbnails(),
		experiments = mw.config.get( 'wgMFExperiments' ) || {},
		betaOptinPanel,
		TOP_OF_ARTICLE = 'top-of-article';

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
		var version = TOP_OF_ARTICLE,
			// This catches language selectors in page actions and in secondary actions (e.g. Main Page)
			$primaryBtn = $( '.language-selector' );

		/**
		 * Log impression when the language button is seen by the user
		 * @ignore
		 */
		function logLanguageButtonImpression() {
			// Note we do not log an event for both buttons when they are both visible
			if ( mw.viewport.isElementInViewport( $primaryBtn ) ) {
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

		/**
		 * Capture a tap on the language switcher
		 *
		 * @ignore
		 */
		function captureTap() {
			var tapCountBucket,
				previousTapCount = settings.get( 'mobile-language-button-tap-count' );

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
				languageButtonVersion: version,
				languageButtonTappedBucket: tapCountBucket,
				primaryLanguageOfUser: getDeviceLanguage() || 'unknown'
			} );
		}

		if ( $primaryBtn.length ) {
			mw.track( 'mf.schemaMobileWebLanguageSwitcher', {
				event: 'pageLoaded',
				beaconCapable: $.isFunction( navigator.sendBeacon )
			} );

			M.on( 'scroll', logLanguageButtonImpression );
			// maybe the button is already visible?
			logLanguageButtonImpression();

			// We only bind the click event to the first language switcher in page
			$primaryBtn.on( 'click', function ( ev ) {
				ev.preventDefault();

				if ( $primaryBtn.attr( 'href' ) || $primaryBtn.find( 'a' ).length ) {
					router.navigate( '/languages' );
				} else {
					toast.show( mw.msg( 'mobile-frontend-languages-not-available' ) );
				}
				captureTap();
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
			/**
			 * @private
			 * @ignore
			 * @param {ImageOverlay} ImageOverlay Overlay class to initialize
			 */
			resolveWithOverlay = function ( ImageOverlay ) {
				result.resolve(
					new ImageOverlay( {
						api: new mw.Api(),
						thumbnails: thumbs,
						title: decodeURIComponent( title )
					} )
				);
			};

		if ( useNewMediaViewer ) {
			loader.loadModule( 'mobile.mediaViewer.beta' ).done( function () {
				var ImageOverlayBeta = M.require( 'mobile.mediaViewer.beta/ImageOverlayBeta' );
				resolveWithOverlay( ImageOverlayBeta );
			} );
		} else {
			loader.loadModule( 'mobile.mediaViewer' ).done( function () {
				var ImageOverlay = M.require( 'mobile.mediaViewer/ImageOverlay' );
				resolveWithOverlay( ImageOverlay );
			} );
		}

		return result;
	}

	// Routes
	overlayManager.add( /^\/media\/(.+)$/, loadImageOverlay );
	overlayManager.add( /^\/languages$/, function () {
		var result = $.Deferred(),
			lang = mw.config.get( 'wgUserLanguage' );

		loader.loadModule( 'mobile.languages.structured', true ).done( function ( loadingOverlay ) {
			var PageGateway = M.require( 'mobile.startup/PageGateway' ),
				gateway = new PageGateway( new mw.Api() ),
				LanguageOverlay = M.require( 'mobile.languages.structured/LanguageOverlay' );

			gateway.getPageLanguages( mw.config.get( 'wgPageName' ), lang ).done( function ( data ) {
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
		var delta, historyUrl, msg, $bar,
			ts, username, gender;

		historyUrl = $lastModifiedLink.attr( 'href' );
		ts = $lastModifiedLink.data( 'timestamp' );
		username = $lastModifiedLink.data( 'user-name' ) || false;
		gender = $lastModifiedLink.data( 'user-gender' );

		if ( ts ) {
			delta = time.getTimeAgoDelta( parseInt( ts, 10 ) );
			if ( time.isRecent( delta ) ) {
				$bar = $lastModifiedLink.closest( '.last-modified-bar' );
				$bar.addClass( 'active' );
				// in beta update icons to be inverted
				$bar.find( '.mw-ui-icon' ).each( function () {
					$( this ).attr( 'class', $( this ).attr( 'class' ).replace( '-gray', '-invert' ) );
				} );
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
		// FIXME: Drop id selector when footer v2 in stable (T141002)
		initHistoryLink( $( '#mw-mf-last-modified a, .last-modifier-tagline a' ) );
	} );
}( mw.mobileFrontend, jQuery ) );
