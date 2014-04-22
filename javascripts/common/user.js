( function( M, $ ) {
	var user;

	/**
	 * @class user
	 * @singleton
	*/
	user = $.extend( {}, mw.user, {
		/**
		 * Find current users edit count
		 * @method
		 * @returns {Number} the edit count of the current user on the current wiki.
		 */
		getEditCount: function() {
			return mw.config.get( 'wgUserEditCount' );
		},
		/**
		 * FIXME: Not sure why mw.user is asynchronous when the information is available
		 * For reasons I do not understand getGroups in core causes an unnecessary ajax request
		 * The information this returns is identical to the content of the config variable.
		 * To avoid an unnecessary ajax request on every page view simply use config variable.
		 */
		getGroups: function() {
			return $.Deferred().resolve( mw.config.get( 'wgUserGroups' ) );
		}
	} );
	M.define( 'user', user );

}( mw.mobileFrontend, jQuery ) );
