var
	Icon = require( './Icon' ),
	util = require( './util' );

/**
 * A set of shared icons.
 *
 * Factory methods are used to keep separate features that use the same icons
 * from accidentally manipulating one another's DOM when calling methods like
 * `remove`.
 *
 * @class icons
 * @singleton
 * @uses Icon
 */
module.exports = {
	/**
	 * Gets a spinner icon.
	 *
	 * The icon should be used to inform the user that the front-end is
	 * communicating with the back-end.
	 * @memberof icons
	 * @instance
	 * @param {Object} [options] See `Icon` for more details
	 * @return {Icon}
	 */
	spinner: function ( options ) {
		options = options || {};

		return new Icon( util.extend( options, {
			name: 'spinner',
			label: mw.msg( 'mobile-frontend-loading-message' ),
			additionalClassNames: 'spinner loading'
		} ) );
	}
};
