( function ( M, $ ) {
	var user = M.require( 'user' );

	/**
	 * FIXME: Use Class/inheritance for EventLogging.
	 * @param {Object} data to extend the default options with
	 * @ignore
	 * @returns {jQuery.Deferred}
	 */
	function log( data ) {
		var options = {
			token: M.getSessionId(),
			revId: mw.config.get( 'wgRevisionId' ),
			namespace: mw.config.get( 'wgNamespaceNumber' ),
			userEditCount: user.getEditCount() || 0,
			isTestA: M.isTestA,
			pageId: mw.config.get( 'wgArticleId' ),
			username: user.getName() || '',
			mobileMode: M.getMode()
		};
		return M.log( 'MobileWebEditing', $.extend( options, data ) );
	}

	M.define( 'loggingSchemas/mobileWebEditing', {
		log: log
	} );

} )( mw.mobileFrontend, jQuery );
