( function( M, $ ) {
	var user;

	/**
	 * @namespace
	 * @name mw.user
	 */
	user = $.extend( {}, mw.user, {
		/**
		 * Find current users edit count
		 * @name mw.user.getEditCount
		 * @function
		 * @returns {Integer} the edit count of the current user on the current wiki.
		 */
		getEditCount: function() {
			return mw.config.get( 'wgUserEditCount' );
		}
	} );
	M.define( 'user', user );

}( mw.mobileFrontend, jQuery ) );
