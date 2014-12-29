// FIXME: make this an object with a constructor to facilitate testing
// (see https://bugzilla.wikimedia.org/show_bug.cgi?id=44264)
/**
 * mobileFrontend namespace
 * @class mw.mobileFrontend
 * @singleton
 */
( function ( M, $ ) {
	var Router = M.require( 'Router' ),
		browser = M.require( 'browser' ),
		OverlayManager = M.require( 'OverlayManager' ),
		qs = window.location.search.split( '?' )[1],
		PageApi = M.require( 'PageApi' ),
		pageApi = new PageApi(),
		Page = M.require( 'Page' ),
		router = new Router(),
		currentPage,
		inWideScreenMode = false,
		// FIXME: Move all the variables below to Browser.js
		ua = window.navigator.userAgent,
		isIos = browser.isIos(),
		isOldIPhone = isIos && /OS [4]_[0-2]|OS [3]_/.test( ua );

	/**
	 * Escape dots and colons in a hash, jQuery doesn't like them beause they
	 * look like CSS classes and pseudoclasses. See
	 * http://bugs.jquery.com/ticket/5241
	 * http://stackoverflow.com/questions/350292/how-do-i-get-jquery-to-select-elements-with-a-period-in-their-id
	 *
	 * @method
	 * @param {String} hash A hash to escape
	 * @return {String}
	 */
	function escapeHash( hash ) {
		return hash.replace( /(:|\.)/g, '\\$1' );
	}

	/**
	 * Tests current window size and if suitable loads styles and scripts specific for larger devices
	 * FIXME: Separate from application.js
	 *
	 * @method
	 */
	function loadWideScreenModules() {
		var modules = [];
		if ( !inWideScreenMode && browser.isWideScreen() &&
			mw.config.get( 'skin' ) === 'minerva' ) {
			// Adjust screen for tablets
			if ( inNamespace( '' ) ) {
				modules.push( 'tablet.scripts' );
			}
			inWideScreenMode = true;
			mw.loader.using( modules, function () {
				M.emit( 'resize' );
			} );
		}
	}

	/**
	 * Initialize viewport
	 * @method
	 */
	function init() {
		var
			$viewport = $( '#mw-mf-viewport' );

		// FIXME: This shouldn't be necessary
		$( '<div id="notifications">' ).appendTo( $viewport );

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

		$( loadWideScreenModules );
		$( window ).on( 'resize', $.proxy( M, 'emit', 'resize' ) );
		M.on( 'resize', loadWideScreenModules );
	}

	/**
	 * FIXME: sandbox from mf-application.js
	 *
	 * @method
	 * @param {String} schemaName
	 * @param {Object} data
	 * @return {jQuery.Deferred}
	 */
	function log( schemaName, data ) {
		if ( mw.eventLog ) {
			return mw.eventLog.logEvent( schemaName, data );
		} else {
			return $.Deferred().reject( 'EventLogging not installed.' );
		}
	}

	/**
	 * Retrieve and, if not present, generate a random session ID
	 * (32 alphanumeric characters).
	 * FIXME: Use mw.user
	 * FIXME: Fall back to using cookies if localStorage isn't supported
	 *
	 * @method
	 * @return {string}
	 */
	function getSessionId() {
		var sessionId;
		if ( !browser.supportsLocalStorage() ) {
			return '';
		}
		sessionId = localStorage.getItem( 'sessionId' );

		if ( !sessionId ) {
			// FIXME: use mw.user.generateRandomSessionId when we can,
			// as of now mediawiki.user has no mobile target (yay, targets in RL!)
			sessionId = '';
			while ( sessionId.length < 32 ) {
				// http://stackoverflow.com/a/8084248/365238
				sessionId += Math.random().toString( 36 ).slice( 2, 32 + 2 - sessionId.length );
			}
			localStorage.setItem( 'sessionId', sessionId );
		}
		return sessionId;
	}

	/**
	 * Takes a Query string and turns it into a JavaScript object mapping parameter names
	 * to values. Does the opposite of $.param
	 *
	 * @method
	 * @ignore
	 * @param {String} qs A querystring excluding the ? prefix. e.g. foo=4&bar=5
	 * @return {Object}
	 */
	function deParam( qs ) {
		var params = {};
		if ( qs ) {
			$.each( qs.split( '&' ), function ( index, p ) {
				p = p.split( '=' );
				params[ p[0] ] = p[1];
			} );
		}
		return params;
	}

	/**
	 * Determine if current page is in a specified namespace
	 * FIXME: Move to method on Page
	 * @method
	 * @param {string} namespace Name of namespace
	 * @return {Boolean}
	 */
	function inNamespace( namespace ) {
		return mw.config.get( 'wgNamespaceNumber' ) === mw.config.get( 'wgNamespaceIds' )[namespace];
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
			id: mw.config.get( 'wgArticleId' )
		} );
		return currentPage;
	}

	$.extend( M, {
		init: init,
		escapeHash: escapeHash,
		inNamespace: inNamespace,
		getCurrentPage: getCurrentPage,
		getSessionId: getSessionId,
		log: log,
		query: deParam( qs ),
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
