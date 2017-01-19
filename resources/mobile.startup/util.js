( function ( M ) {
	var util;

	/**
	 * Utility library
	 * @class util
	 * @singleton
	 */
	util = {
		/**
		 * Escape dots and colons in a hash, jQuery doesn't like them beause they
		 * look like CSS classes and pseudoclasses. See
		 * http://bugs.jquery.com/ticket/5241
		 * http://stackoverflow.com/questions/350292/how-do-i-get-jquery-to-select-elements-with-a-period-in-their-id
		 *
		 * @method
		 * @param {string} hash A hash to escape
		 * @return {string}
		 */
		escapeHash: function ( hash ) {
			return hash.replace( /(:|\.)/g, '\\$1' );
		}
	};

	M.define( 'mobile.startup/util', util );

}( mw.mobileFrontend, jQuery ) );
