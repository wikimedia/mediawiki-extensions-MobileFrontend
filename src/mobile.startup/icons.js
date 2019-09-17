var
	CANCEL_GLYPH = 'close',
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
	 * Gets a back icon
	 *
	 * The icon should be used to inform the user that the front-end is
	 * communicating with the back-end.
	 * @memberof icons
	 * @instance
	 * @return {Icon}
	 */
	back: function () {
		return new Icon( {
			tagName: 'button',
			name: 'arrowPrevious-base20',
			additionalClassNames: 'back',
			label: mw.msg( 'mobile-frontend-overlay-close' )
		} );
	},
	/**
	 * Gets a cancel icon
	 *
	 * The icon should be used to inform the user that the front-end is
	 * communicating with the back-end.
	 * @memberof icons
	 * @instance
	 * @param {string} [variant] defaults to `base20`.
	 * @param {Object} [props] to extend
	 * @return {Icon}
	 */
	cancel: function ( variant, props ) {
		var glyph = variant ? `${CANCEL_GLYPH}-${variant}` : `${CANCEL_GLYPH}-base20`;
		return new this.Icon( util.extend( {
			tagName: 'button',
			name: glyph,
			additionalClassNames: 'cancel',
			label: mw.msg( 'mobile-frontend-overlay-close' )
		}, props || {} ) );
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
		if ( options.additionalClassNames === undefined ) {
			options.additionalClassNames = 'spinner loading';
		}

		return new this.Icon( util.extend( options, {
			name: 'spinner',
			label: mw.msg( 'mobile-frontend-loading-message' )
		} ) );
	},
	/**
	 * Gets a failure (error) icon
	 *
	 * @memberof icons
	 * @instance
	 * @return {Icon}
	 */
	error: function () {
		return new Icon( {
			name: 'alert-invert',
			additionalClassNames: 'load-fail-msg-icon'
		} );
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
			name: 'star-base20',
			glyphPrefix: 'wikimedia',
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
			name: 'unStar-progressive',
			glyphPrefix: 'wikimedia',
			additionalClassNames: 'watch-this-article watched'
		} );
	}
};
