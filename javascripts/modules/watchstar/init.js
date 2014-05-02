( function( M, $ ) {

	var Watchstar = M.require( 'modules/watchstar/Watchstar' ),
		user = M.require( 'user' );

	/**
	 * Toggle the watch status of a known page
	 * @method
	 * @param {Page} page
	 * @param {boolean} isWatched (optional) if undefined this will result in an API hit
	 */
	function init( page, isWatched ) {
		var $container = $( '#ca-watch' );
		new Watchstar( {
			el: $container,
			isWatched: isWatched,
			page: page,
			isAnon: user.isAnon()
		} );
	}
	$( function() {
		var isWatched = $( '#ca-watch' ).hasClass( 'watched' );
		if ( !M.inNamespace( 'special' ) ) {
			// FIXME: isWatched property should be part of the page object and returned by api mobileview
			init( M.getCurrentPage(), isWatched );
			M.on( 'page-loaded', init );
		}
	} );

}( mw.mobileFrontend, jQuery ) );
