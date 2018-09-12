/* global jQuery */

// FIXME: make this an object with a constructor to facilitate testing
// (see https://bugzilla.wikimedia.org/show_bug.cgi?id=44264)
/**
 * mobileFrontend namespace
 * @class mw.mobileFrontend
 * @singleton
 */
( function ( M, $, storage ) {
	var currentPage, skin,
		PageGateway = M.require( 'mobile.startup/PageGateway' ),
		BetaOptinPanel = M.require( 'mobile.init/BetaOptinPanel' ),
		gateway = new PageGateway( new mw.Api() ),
		util = mw.util,
		mfUtil = M.require( 'mobile.startup/util' ),
		$window = mfUtil.getWindow(),
		$html = mfUtil.getDocument(),
		user = mw.user,
		context = M.require( 'mobile.startup/context' ),
		Page = M.require( 'mobile.startup/Page' ),
		experiments = mw.experiments,
		activeExperiments = mw.config.get( 'wgMFExperiments' ) || {},
		Skin = M.require( 'mobile.startup/Skin' ),
		ReferencesMobileViewGateway = M.require(
			'mobile.references.gateway/ReferencesMobileViewGateway'
		),
		skinData = {
			el: 'body',
			page: getCurrentPage(),
			referencesGateway: ReferencesMobileViewGateway.getSingleton()
		};

	skin = new Skin( skinData );
	M.define( 'mobile.init/skin', skin ); // resource-modules-disable-line

	/**
	 * Given 2 functions, it returns a function that will run both with it's
	 * context and parameters and return the results combined
	 * @private
	 * @param {Function} fn1
	 * @param {Function} fn2
	 * @return {Function} which returns the results of [fn1, fn2]
	 */
	function apply2( fn1, fn2 ) {
		return function () {
			return [
				fn1.apply( this, arguments ),
				fn2.apply( this, arguments )
			];
		};
	}

	/**
	 * The `window`'s resize event debounced at 100 ms.
	 * The `resize:throttled` event is the `window`'s
	 * resize event throttled to 200 ms.
	 * @event resize
	 */

	/**
	 * The `window`'s scroll event debounced at 100 ms.
	 * The `scroll:throttled` event is the `window`'s
	 * scroll event throttled to 200 ms.
	 * @event scroll
	 */

	$window
		.on( 'resize', apply2(
			$.debounce( 100, $.proxy( M, 'emit', 'resize' ) ),
			$.throttle( 200, $.proxy( M, 'emit', 'resize:throttled' ) )
		) )
		.on( 'scroll', apply2(
			$.debounce( 100, $.proxy( M, 'emit', 'scroll' ) ),
			$.throttle( 200, $.proxy( M, 'emit', 'scroll:throttled' ) )
		) );

	/**
	 * Get current page view object
	 * FIXME: Move to M.define( 'page' )
	 * @return {Page}
	 */
	function getCurrentPage() {
		if ( currentPage ) {
			return currentPage;
		} else {
			return loadCurrentPage();
		}
	}

	/**
	 * Constructs an incomplete Page object representing the currently loaded page.
	 *
	 * @private
	 * @return {Page}
	 */
	function loadCurrentPage() {
		var permissions = mw.config.get( 'wgRestrictionEdit', [] ),
			$content = $( '#content #bodyContent' );
		if ( permissions.length === 0 ) {
			permissions.push( '*' );
		}
		currentPage = new Page( {
			el: $content,
			title: mw.config.get( 'wgPageName' ).replace( /_/g, ' ' ),
			protection: {
				edit: permissions
			},
			revId: mw.config.get( 'wgRevisionId' ),
			isMainPage: mw.config.get( 'wgIsMainPage' ),
			isWatched: $( '#ca-watch' ).hasClass( 'watched' ),
			sections: gateway.getSectionsFromHTML( $content ),
			isMissing: mw.config.get( 'wgArticleId' ) === 0,
			id: mw.config.get( 'wgArticleId' ),
			namespaceNumber: mw.config.get( 'wgNamespaceNumber' )
		} );
		return currentPage;
	}

	/**
	 * Displays a prompt to ask the user to join the mobile beta mode.
	 *
	 * @private
	 * @param {Object} experiment sampling data
	 * @param {Page} page
	 */
	function displayBetaOptIn( experiment, page ) {
		var betaOptinPanel, inStable, inSample,
			token = storage.get( 'mobile-betaoptin-token' );

		// local storage is supported in this case, when ~ means it was dismissed
		if ( token !== false && token !== '~' &&
			!page.isMainPage() && !page.inNamespace( 'special' )
		) {
			if ( !token ) {
				token = user.generateRandomSessionId();
				storage.set( 'mobile-betaoptin-token', token );
			}

			inStable = context.getMode() === 'stable';
			inSample = experiments.getBucket( experiment, token ) === 'A';
			if ( inStable && ( inSample || util.getParamValue( 'debug' ) ) ) {
				betaOptinPanel = new BetaOptinPanel( {
					postUrl: util.getUrl( 'Special:MobileOptions', {
						returnto: page.title
					} )
				} );

				betaOptinPanel
					.on( 'hide', function () {
						storage.set( 'mobile-betaoptin-token', '~' );
					} ).appendTo( page.getLeadSectionElement() );
			}

			// let the interested parties e.g. QuickSurveys know whether the panel is shown
			mw.track( 'mobile.betaoptin', {
				isPanelShown: betaOptinPanel !== undefined
			} );
		}
	}

	/**
	 * Updates the font size based on the current value in storage
	 */
	function updateFontSize() {
		// FIXME: Ideally 'regular' would come from a shared constant
		// (currently not possible without using webpack)
		var userFontSize = storage.get( 'userFontSize', 'regular' );
		$html.addClass( 'mf-font-size-' + userFontSize );
	}

	// Font must be updated on back button press as users may click
	// back after changing font.
	$window.on( 'pageshow', function () {
		updateFontSize();
	} );
	updateFontSize();

	if ( activeExperiments.betaoptin ) {
		displayBetaOptIn( activeExperiments.betaoptin, getCurrentPage() );
	}

	// Recruit volunteers through the console
	// (note console.log may not be a function so check via apply)
	/* eslint-disable no-console */
	if ( window.console && window.console.log && window.console.log.apply &&
			mw.config.get( 'wgMFEnableJSConsoleRecruitment' ) ) {
		console.log( mw.msg( 'mobile-frontend-console-recruit' ) );
	}

	mfUtil.extend( M, {
		getCurrentPage: getCurrentPage
	} );

	/* eslint-enable no-console */
}( mw.mobileFrontend, jQuery, mw.storage ) );
