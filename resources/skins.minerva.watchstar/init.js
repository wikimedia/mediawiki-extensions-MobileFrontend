( function ( M, $ ) {

	var Watchstar = M.require( 'mobile.watchstar/Watchstar' ),
		user = M.require( 'mobile.user/user' );

	/**
	 * Toggle the watch status of a known page
	 * @method
	 * @param {Page} page
	 * @ignore
	 */
	function init( page ) {
		var $container = $( '#ca-watch' );
		if ( !page.inNamespace( 'special' ) ) {
			new Watchstar( {
				api: new mw.Api(),
				el: $container,
				isWatched: page.isWatched(),
				page: page,
				funnel: 'page',
				isAnon: user.isAnon()
			} );
		}
	}
	init( M.getCurrentPage() );

}( mw.mobileFrontend, jQuery ) );
