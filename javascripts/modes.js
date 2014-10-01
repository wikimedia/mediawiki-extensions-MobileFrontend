/**
 *
 * @class mw.mobileFrontend
 * @singleton
 */
( function( $ ) {
mw.mobileFrontend = $.extend( {

	/**
	 * @method
	 * @return {Boolean}
	 */
	isAlphaGroupMember: function() {
		return mw.config.get( 'wgMFMode' ) === 'alpha';
	},

	/**
	 * @method
	 * @return {Boolean}
	 */
	isBetaGroupMember: function() {
		return mw.config.get( 'wgMFMode' ) === 'beta' || this.isAlphaGroupMember();
	},

	/**
	 * @method
	 * @return {Boolean}
	 */
	isApp: function() {
		return mw.config.get( 'wgMFMode' ) === 'app';
	},

	/**
	 * @method
	 * @throws Error when a module is run out of its allowed modes
	 */
	assertMode: function( modes ) {
		var mode = mw.config.get( 'wgMFMode' );
		if ( $.inArray( mode, modes ) === -1 ) {
			throw new Error( 'Attempt to run module outside declared environment mode ' + mode  );
		}
	}
}, mw.mantle );

} ( jQuery ) );
