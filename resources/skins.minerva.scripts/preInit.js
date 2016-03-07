// FIXME: make this an object with a constructor to facilitate testing
// (see https://bugzilla.wikimedia.org/show_bug.cgi?id=44264)
/**
 * mobileFrontend namespace
 * @class mw.mobileFrontend
 * @singleton
 */
( function ( M, $ ) {
	var currentPage, skin,
		PageGateway = M.require( 'mobile.startup/PageGateway' ),
		gateway = new PageGateway( new mw.Api() ),
		Page = M.require( 'mobile.startup/Page' ),
		mainMenu = M.require( 'skins.minerva.scripts.top/mainMenu' ),
		Skin = M.require( 'mobile.startup/Skin' );

	skin = new Skin( {
		el: 'body',
		tabletModules: mw.config.get( 'skin' ) === 'minerva' ? [ 'skins.minerva.tablet.scripts' ] : [],
		page: getCurrentPage(),
		mainMenu: mainMenu
	} );
	M.define( 'skins.minerva.scripts/skin', skin ).deprecate( 'mobile.startup/skin' );

	$( window )
		.on( 'resize', $.debounce( 100, $.proxy( M, 'emit', 'resize' ) ) )
		.on( 'scroll', $.debounce( 100, $.proxy( M, 'emit', 'scroll' ) ) );

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
	if ( window.console && window.console.log && window.console.log.apply &&
			mw.config.get( 'wgMFEnableJSConsoleRecruitment' ) ) {
		console.log( mw.msg( 'mobile-frontend-console-recruit' ) );
	}
}( mw.mobileFrontend, jQuery ) );
