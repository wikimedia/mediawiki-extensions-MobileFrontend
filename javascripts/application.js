// FIXME: make this an object with a constructor to facilitate testing
// (see https://bugzilla.wikimedia.org/show_bug.cgi?id=44264)
/**
 * mobileFrontend namespace
 * @class mw.mobileFrontend
 * @singleton
 */
( function ( M, $ ) {
	var currentPage, skin,
		Router = M.require( 'Router' ),
		browser = M.require( 'browser' ),
		OverlayManager = M.require( 'OverlayManager' ),
		PageApi = M.require( 'PageApi' ),
		pageApi = new PageApi(),
		Page = M.require( 'Page' ),
		router = new Router(),
		Skin = M.require( 'Skin' ),
		// FIXME: Move all the variables below to Browser.js
		ua = window.navigator.userAgent,
		isIos = browser.isIos(),
		isOldIPhone = isIos && /OS [4]_[0-2]|OS [3]_/.test( ua );

	/**
	 * Initialize viewport
	 * @method
	 */
	function init() {
		var
			$viewport = $( '#mw-mf-viewport' );

		if ( browser.supportsAnimations() ) {
			$viewport.addClass( 'animations' );
		}
		if ( !browser.supportsPositionFixed() ) {
			$viewport.addClass( 'no-position-fixed' );
		}
		if ( browser.supportsTouchEvents() ) {
			$viewport.addClass( 'touch-events' );
		}

		// FIXME: Move to Browser.js
		if ( !browser.supportsPositionFixed() ) {
			$( window ).on( 'scroll', function () {
				var scrollTop = $( window ).scrollTop(),
					windowHeight = $( window ).height(),
					activeElement = document.activeElement,
					scrollBottom = scrollTop + windowHeight;
				if ( isOldIPhone ) {
					if ( activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT' ) {
						// add the height of the open soft keyboard
						scrollBottom -= 120;
					} else {
						// add the height of the address bar
						scrollBottom += 60;
					}
				}

				if ( scrollTop === 0 ) {
					// special case when we're at the beginning of the page and many
					// browsers (e.g. Android 2.x) return wrong window height because
					// of the URL bar
					$viewport.add( '.overlay' ).height( '100%' );
				} else {
					// keep expanding the viewport until the end of the page reached
					// #notification has bottom: 0 and sticks to the end of the viewport
					$viewport.add( '.overlay' ).height( scrollBottom );
				}
			} );
		}

		skin = new Skin( {
			tabletModules: mw.config.get( 'skin' ) === 'minerva' ? [ 'tablet.scripts' ] : [],
			page: getCurrentPage()
		} );
		$( window ).on( 'resize', $.proxy( M, 'emit', 'resize' ) );
	}

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
	 * @ignore
	 */
	function loadCurrentPage() {
		var permissions = mw.config.get( 'wgRestrictionEdit', [] );
		if ( permissions.length === 0 ) {
			permissions.push( '*' );
		}
		currentPage = new Page( {
			el: '#content',
			title: mw.config.get( 'wgPageName' ).replace( /_/g, ' ' ),
			protection: {
				edit: permissions
			},
			isMainPage: mw.config.get( 'wgIsMainPage' ),
			isWatched: $( '#ca-watch' ).hasClass( 'watched' ),
			sections: pageApi.getSectionsFromHTML( $( '#content' ) ),
			id: mw.config.get( 'wgArticleId' ),
			namespaceNumber: mw.config.get( 'wgNamespaceNumber' )
		} );
		return currentPage;
	}

	$.extend( M, {
		init: init,
		getCurrentPage: getCurrentPage,
		/**
		 * Navigation router instance
		 * @type {Router}
		 */
		router: router,
		/**
		 * OverlayManager instance
		 * @type {OverlayManager}
		 */
		overlayManager: new OverlayManager( router ),
		/**
		 * PageApi instance
		 * @type {PageApi}
		 */
		pageApi: pageApi,
		/**
		 * User Bucketing for A/B testing
		 ** (we want this to be the same everywhere)
		 * @type {Boolean}
		 */
		isTestA: mw.config.get( 'wgUserId' ) % 2 === 0
	} );

	// Initialize
	$( init );
}( mw.mobileFrontend, jQuery ) );
