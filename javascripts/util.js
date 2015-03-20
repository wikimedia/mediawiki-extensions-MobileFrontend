( function ( M ) {
	var util;

	/**
	 * Utility library for looking up details on the current user
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
		 * @param {String} hash A hash to escape
		 * @return {String}
		 */
		escapeHash: function ( hash ) {
			return hash.replace( /(:|\.)/g, '\\$1' );
		},
		/**
		 * Return wgWikiBaseItemID config variable or 'wikidataid' query parameter if exits
		 * @returns {null|String}
		 */
		getWikiBaseItemId: function () {
			var id = mw.config.get( 'wgWikibaseItemId' ),
				idOverride;

			if ( !id ) {
				idOverride = mw.util.getParamValue( 'wikidataid' );
				if ( idOverride ) {
					mw.config.set( 'wgWikibaseItemId', idOverride );
					id = idOverride;
				}
			}
			return id;
		}
	};

	M.define( 'util', util );

}( mw.mobileFrontend ) );
