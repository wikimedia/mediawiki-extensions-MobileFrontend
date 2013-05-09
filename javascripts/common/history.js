( function( M, $ ) {

M.history = ( function() {

	/**
	 * Generate a URL for a given page title.
	 *
	 * @param {string} title Title of the page to generate link for.
	 * @param {Object} params A mapping of query parameter names to values,
	 * e.g. { action: 'edit' }.
	 * @return {string}
	 */
	function getArticleUrl( title, params ) {
		var url = mw.config.get( 'wgArticlePath' ).replace( '$1', M.prettyEncodeTitle( title ) );
		if ( !$.isEmptyObject( params ) ) {
			url += '?' + $.param( params );
		}
		return url;
	}

	return {
		getArticleUrl: getArticleUrl
	};
}() );

} ( mw.mobileFrontend, jQuery ) );
