var
	CANCEL_GLYPH = 'overlay-close',
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
	CANCEL_GLYPH: CANCEL_GLYPH,
	// Exported to support testing and stubbing
	Icon: Icon,
	/**
	 * Gets a cancel icon
	 *
	 * The icon should be used to inform the user that the front-end is
	 * communicating with the back-end.
	 * @memberof icons
	 * @instance
	 * @param {string} variant
	 * @return {Icon}
	 */
	cancel: function ( variant ) {
		var glyph = variant ? CANCEL_GLYPH + '-' + variant : CANCEL_GLYPH;
		return new this.Icon( {
			tagName: 'button',
			name: glyph,
			additionalClassNames: 'cancel',
			label: mw.msg( 'mobile-frontend-overlay-close' )
		} );
	},
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

		return new this.Icon( util.extend( options, {
			name: 'spinner',
			label: mw.msg( 'mobile-frontend-loading-message' ),
			additionalClassNames: 'spinner loading'
		} ) );
	},
	/**
	 * Gets a non-filled watch star icon.
	 *
	 * @memberof icons
	 * @instance
	 * @return {Icon}
	 */
	watchIcon: function () {
		return new this.Icon( {
			name: 'watch',
			additionalClassNames: 'watch-this-article'
		} );
	},
	/**
	 * Gets a filled watch star icon.
	 *
	 * @memberof icons
	 * @instance
	 * @return {Icon}
	 */
	watchedIcon: function () {
		return new this.Icon( {
			name: 'watched',
			additionalClassNames: 'watch-this-article watched'
		} );
	}
};
