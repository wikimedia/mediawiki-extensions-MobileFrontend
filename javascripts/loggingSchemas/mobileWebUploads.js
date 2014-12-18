( function ( M, $ ) {
	var user = M.require( 'user' );

	/**
	 * Create a function that can be used to log events to MobileWebUploads
	 * @param {String} funnel to associate upload with
	 * @returns {Function}
	 * @ignore
	 */
	function getLog( funnel ) {

		/**
		 * Log events to MobileWebUploads
		 * @param {Object} data to extend the default options with
		 * @ignore
		 */
		function logger( data ) {
			if ( mw.config.get( 'wgArticleId', -1 ) !== -1 ) {
				data.pageId = mw.config.get( 'wgArticleId' );
			}

			M.log( 'MobileWebUploads', $.extend( {
				token: M.getSessionId(),
				funnel: funnel,
				username: user.getName(),
				isEditable: mw.config.get( 'wgIsPageEditable' ),
				mobileMode: M.getMode()
			}, data ) );
		}

		return logger;
	}

	M.define( 'loggingSchemas/mobileWebUploads', {
		getLog: getLog
	} );

}( mw.mobileFrontend, jQuery ) );
