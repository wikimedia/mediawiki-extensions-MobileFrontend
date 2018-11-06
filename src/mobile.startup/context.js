/**
 * Mobile mode helper class
 *
 * @class context
 * @singleton
 */
module.exports = {
	/**
	 * Gets current mobile mode
	 * @memberof context
	 * @instance
	 * @return {string|null} Name of mode - either `stable` or `beta`. It is `null` if desktop.
	 */
	getMode: function () {
		return mw.config.get( 'wgMFMode' );
	}
};
