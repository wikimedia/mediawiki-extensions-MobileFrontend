/**
 * Mobile mode helper class
 *
 * @class context
 * @singleton
 */
var context = {
	/**
	 * Gets current mobile mode
	 * @memberof context
	 * @instance
	 * @return {string} Name of mode
	 */
	getMode: function () {
		return mw.config.get( 'wgMFMode' );
	}
};

module.exports = context;
