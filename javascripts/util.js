( function ( M, $ ) {
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
		 * Takes a Query string and turns it into a JavaScript object mapping parameter names
		 * to values. Does the opposite of $.param
		 *
		 * @method
		 * @param {String} qs A querystring excluding the ? prefix. e.g. foo=4&bar=5
		 * @return {Object}
		 */
		deParam: function ( qs ) {
			var params = {};
			if ( qs ) {
				$.each( qs.split( '&' ), function ( index, p ) {
					p = p.split( '=' );
					params[ p[0] ] = p[1];
				} );
			}
			return params;
		},
		/**
		 * Maps current query string parameters to their values.
		 *
		 * @property {Object} query
		 */
		query: {},
		/**
		 * Return wgWikiBaseItemID config variable or 'wikidataid' query parameter if exits
		 * @returns {null|String}
		 */
		getWikiBaseItemId: function () {
			var id = mw.config.get( 'wgWikibaseItemId' ),
				idOverride;

			if ( !id ) {
				idOverride = this.query.wikidataid;
				if ( idOverride ) {
					mw.config.set( 'wgWikibaseItemId', idOverride );
					id = idOverride;
				}
			}
			return id;
		}
	};

	util.query = util.deParam( window.location.search.split( '?' )[1] );
	M.define( 'util', util );

}( mw.mobileFrontend, jQuery ) );
