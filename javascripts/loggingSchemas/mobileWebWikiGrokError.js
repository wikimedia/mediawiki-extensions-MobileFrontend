( function ( M, $ ) {
	/**
	 * FIXME: Use Class/inheritance for EventLogging.
	 * @param {Object} data to extend the default options with
	 * Log event to MobileWebWikiGrokError.
	 * @ignore
	 * @returns {jQuery.Deferred}
	 */
	function log( data ) {
		var options = {
			pageId: mw.config.get( 'wgArticleId' ),
			mobileMode: M.getMode()
		};
		return M.log( 'MobileWebWikiGrokError', $.extend( options, data ) );
	}

	M.define( 'loggingSchemas/mobileWebWikiGrokError', {
		log: log
	} );

} )( mw.mobileFrontend, jQuery );
