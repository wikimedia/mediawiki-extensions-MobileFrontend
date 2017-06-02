( function ( M ) {
	/**
	 * Mobile mode helper class
	 *
	 * @class context
	 * @singleton
	 */
	var context = {
		/**
		 * Gets current mobile mode
		 * @method
		 * @return {string} Name of mode
		 */
		getMode: function () {
			return mw.config.get( 'wgMFMode' );
		}
	};

	M.define( 'mobile.startup/context', context );

}( mw.mobileFrontend ) );
