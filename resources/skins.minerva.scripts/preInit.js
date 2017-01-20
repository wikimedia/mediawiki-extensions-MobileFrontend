// FIXME: make this an object with a constructor to facilitate testing
// (see https://bugzilla.wikimedia.org/show_bug.cgi?id=44264)
/**
 * mobileFrontend namespace
 * @class mw.mobileFrontend
 * @singleton
 */
( function ( M, $ ) {
	var currentPage, skin,
		OverlayManager = M.require( 'mobile.startup/OverlayManager' ),
		overlayManager = new OverlayManager( require( 'mediawiki.router' ) ),
		PageGateway = M.require( 'mobile.startup/PageGateway' ),
		gateway = new PageGateway( new mw.Api() ),
		Page = M.require( 'mobile.startup/Page' ),
		mainMenu = M.require( 'skins.minerva.scripts.top/mainMenu' ),
		toast = M.require( 'mobile.startup/toast' ),
		Skin = M.require( 'mobile.startup/Skin' ),
		ReferencesMobileViewGateway = M.require(
			'mobile.references.gateway/ReferencesMobileViewGateway'
		),
		skinData = {
			el: 'body',
			tabletModules: mw.config.get( 'skin' ) === 'minerva' ? [ 'skins.minerva.tablet.scripts' ] : [],
			page: getCurrentPage(),
			referencesGateway: ReferencesMobileViewGateway.getSingleton(),
			mainMenu: mainMenu
		};

	skin = new Skin( skinData );
	M.define( 'skins.minerva.scripts/skin', skin ).deprecate( 'mobile.startup/skin' );

	( function ( wgRedirectedFrom ) {
		// If the user has been redirected, then show them a toast message (see
		// https://phabricator.wikimedia.org/T146596).

		var redirectedFrom;

		if ( wgRedirectedFrom === null ) {
			return;
		}

		redirectedFrom = mw.Title.newFromText( wgRedirectedFrom );

		if ( redirectedFrom ) {

			// mw.Title.getPrefixedText includes the human-readable namespace prefix.
			toast.show( mw.msg(
				'mobile-frontend-redirected-from',
				redirectedFrom.getPrefixedText()
			) );
		}
	}( mw.config.get( 'wgRedirectedFrom' ) ) );

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
	 * @event resize
	 * The `window`'s resize event debounced at 100 ms. The `resize:throttled` event is the `window`'s
	 * resize event throttled to 200 ms.
	 */

	/**
	 * @event scroll
	 * The `window`'s scroll event debounced at 100 ms. The `scroll:throttled` event is the `window`'s
	 * scroll event throttled to 200 ms.
	 */

	$( window )
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
	 * @method
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
	 * @method
	 * @private
	 * @return {Page}
	 * @ignore
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
			id: mw.config.get( 'wgArticleId' ),
			namespaceNumber: mw.config.get( 'wgNamespaceNumber' )
		} );
		return currentPage;
	}

	$.extend( M, {
		getCurrentPage: getCurrentPage
	} );

	// Recruit volunteers through the console (note console.log may not be a function so check via apply)
	/* eslint-disable no-console */
	if ( window.console && window.console.log && window.console.log.apply &&
			mw.config.get( 'wgMFEnableJSConsoleRecruitment' ) ) {
		console.log( mw.msg( 'mobile-frontend-console-recruit' ) );
	}
	/* eslint-enable no-console */

	M.define( 'skins.minerva.scripts/overlayManager', overlayManager )
		.deprecate( 'mobile.startup/overlayManager' );
}( mw.mobileFrontend, jQuery ) );
