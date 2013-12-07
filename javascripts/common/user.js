// Extends mediawiki user mod
( function( M, $ ) {
	var user = $.extend( {}, mw.user, {
		getEditCount: function() {
			return mw.config.get( 'wgUserEditCount' );
		}
	} );
	M.define( 'user', user );

}( mw.mobileFrontend, jQuery ) );
