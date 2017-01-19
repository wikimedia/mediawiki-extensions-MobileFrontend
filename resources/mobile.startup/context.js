( function ( M, $ ) {
	var context;

	/**
	 * Mobile mode helper class
	 *
	 * @class context
	 * @singleton
	 */
	context = {
		/**
		 * Gets current mobile mode
		 * @method
		 * @return {string} Name of mode
		 */
		getMode: function () {
			return mw.config.get( 'wgMFMode' );
		},

		/**
		 * Determines if mobile mode is beta
		 * @method
		 * @return {boolean}
		 */
		isBetaGroupMember: function () {
			return this.getMode() === 'beta';
		},

		/**
		 * Detect module being run outside allowed mode
		 * @method
		 * @param {Array} modes Array of allowed mode names
		 * @throws Error when a module is run out of its allowed modes
		 */
		assertMode: function ( modes ) {
			var mode = this.getMode();
			if ( $.inArray( mode, modes ) === -1 ) {
				throw new Error( 'Attempt to run module outside declared environment mode ' + mode );
			}
		}
	};

	M.define( 'mobile.startup/context', context )
		.deprecate( 'mobile.context/context' );

}( mw.mobileFrontend, jQuery ) );
