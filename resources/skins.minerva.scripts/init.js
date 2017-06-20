( function ( M, $ ) {
	var inSample, inStable, experiment,
		toast = M.require( 'mobile.startup/toast' ),
		time = M.require( 'mobile.startup/time' ),
		token = mw.storage.get( 'mobile-betaoptin-token' ),
		BetaOptinPanel = M.require( 'mobile.betaoptin/BetaOptinPanel' ),
		loader = M.require( 'mobile.startup/rlModuleLoader' ),
		router = require( 'mediawiki.router' ),
		context = M.require( 'mobile.startup/context' ),
		overlayManager = M.require( 'skins.minerva.scripts/overlayManager' ),
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
		thumbs.forEach( function ( thumb ) {
			thumb.$el.off().data( 'thumb', thumb ).on( 'click', onClickImage );
		} );
	}

	/**
	 * Hijack the Special:Languages link and replace it with a trigger to a LanguageOverlay
	 * that displays the same data
	 * @ignore
	 */
	function initButton() {
		// This catches language selectors in page actions and in secondary actions (e.g. Main Page)
		var $primaryBtn = $( '.language-selector' );

		if ( $primaryBtn.length ) {
			// We only bind the click event to the first language switcher in page
			$primaryBtn.on( 'click', function ( ev ) {
				ev.preventDefault();

				if ( $primaryBtn.attr( 'href' ) || $primaryBtn.find( 'a' ).length ) {
					router.navigate( '/languages' );
				} else {
					toast.show( mw.msg( 'mobile-frontend-languages-not-available' ) );
				}
			} );
		}
	}

	/**
	 * Return the language code of the device in lowercase
	 *
	 * @ignore
	 * @return {string|undefined}
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
	 * @param {string} title Url of image
	 * @return {jQuery.Deferred}
	 */
	function loadImageOverlay( title ) {
		return loader.loadModule( 'mobile.mediaViewer' ).then( function () {
			var ImageOverlay = M.require( 'mobile.mediaViewer/ImageOverlay' );
			return new ImageOverlay( {
				api: new mw.Api(),
				thumbnails: thumbs,
				title: decodeURIComponent( title )
			} );
		} );
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
			mw.storage.set( 'mobile-betaoptin-token', token );
		}

		inStable = context.getMode() === 'stable';
		inSample = mw.experiments.getBucket( experiment, token ) === 'A';
		if ( inStable && ( inSample || mw.util.getParamValue( 'debug' ) ) ) {
			betaOptinPanel = new BetaOptinPanel( {
				postUrl: mw.util.getUrl( 'Special:MobileOptions', {
					returnto: page.title
				} )
			} )
				.on( 'hide', function () {
					mw.storage.set( 'mobile-betaoptin-token', '~' );
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

	/**
	 * Initialisation function for user creation module.
	 *
	 * Enhances an element representing a time
	 + to show a human friendly date in seconds, minutes, hours, days
	 * months or years
	 * @ignore
	 * @param {JQuery.Object} [$tagline]
	 */
	function initRegistrationDate( $tagline ) {
		var msg, ts;

		ts = $tagline.data( 'userpage-registration-date' );

		if ( ts ) {
			msg = time.getRegistrationMessage( ts, $tagline.data( 'userpage-gender' ) );
			$tagline.text( msg );
		}
	}

	/**
	 * Initialisation function for registration date on user page
	 *
	 * Enhances .tagline-userpage element
	 * to show human friendly date in seconds, minutes, hours, days
	 * months or years
	 * @ignore
	 */
	function initRegistrationInfo() {
		$( '#tagline-userpage' ).each( function () {
			initRegistrationDate( $( this ) );
		} );
	}

	$( function () {
		// Update anything else that needs enhancing (e.g. watchlist)
		initModifiedInfo();
		initRegistrationInfo();
		initHistoryLink( $( '.last-modifier-tagline a' ) );
	} );
}( mw.mobileFrontend, jQuery ) );
