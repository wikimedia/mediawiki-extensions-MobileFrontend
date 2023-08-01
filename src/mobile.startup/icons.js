var
	CANCEL_GLYPH = 'close',
	Icon = require( './Icon' ),
	IconButton = require( './IconButton' ),
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
	IconButton: IconButton,
	/**
	 * Gets a back icon
	 *
	 * The icon should be used to inform the user that the front-end is
	 * communicating with the back-end.
	 *
	 * @memberof icons
	 * @instance
	 * @return {IconButton}
	 */
	back: function () {
		return new IconButton( {
			tagName: 'button',
			icon: 'previous-base20',
			additionalClassNames: 'back',
			label: mw.msg( 'mobile-frontend-overlay-close' )
		} );
	},
	/**
	 * Gets a cancel icon
	 *
	 * The icon should be used to inform the user that the front-end is
	 * communicating with the back-end.
	 *
	 * @memberof icons
	 * @instance
	 * @param {string} [variant] defaults to `base20`.
	 * @param {Object} [props] to extend
	 * @return {IconButton}
	 */
	cancel: function ( variant, props = {} ) {
		var glyph = variant ? `${CANCEL_GLYPH}-${variant}` : `${CANCEL_GLYPH}-base20`;
		props.additionalClassNames = props.additionalClassNames || '';
		props.additionalClassNames += ' cancel';

		return new this.IconButton( util.extend( {
			tagName: 'button',
			icon: glyph,
			label: mw.msg( 'mobile-frontend-overlay-close' )
		}, props ) );
	},
	/**
	 * Gets a spinner icon. This uses IconButton but should never actually
	 * be a button or have full button styles, as its purely presentational
	 *
	 * The icon should be used to inform the user that the front-end is
	 * communicating with the back-end.
	 *
	 * @memberof icons
	 * @instance
	 * @param {Object} [props] See `Icon` for more details
	 * @return {IconButton}
	 */
	spinner: function ( props = {} ) {
		if ( props.additionalClassNames === undefined ) {
			props.additionalClassNames = 'spinner loading';
		}

		const spinner = new this.IconButton( util.extend( {
			tagName: 'span',
			icon: 'spinner',
			label: mw.msg( 'mobile-frontend-loading-message' )
		}, props ) );

		// Update the element to not use button classes or attributes
		spinner.$el.removeClass();
		// eslint-disable-next-line mediawiki/class-doc
		spinner.$el.addClass( props.additionalClassNames );
		spinner.$el.attr( 'type', '' );
		if ( spinner.options.isIconOnly ) {
			spinner.$el.addClass( 'mf-icon-element' );
		}
		return spinner;
	},
	/**
	 * Gets a failure (error) icon
	 *
	 * @memberof icons
	 * @instance
	 * @return {IconButton}
	 */
	error: function () {
		return new IconButton( {
			icon: 'alert-invert',
			additionalClassNames: 'load-fail-msg-icon'
		} );
	},
	/**
	 * Gets a non-filled watch star icon.
	 *
	 * @memberof icons
	 * @instance
	 * @param {Object} props
	 * @return {IconButton}
	 */
	watch: function ( props = {} ) {
		props.additionalClassNames = props.additionalClassNames || '';
		props.additionalClassNames += ' watch-this-article';

		return new this.IconButton( util.extend( {
			icon: 'star-subtle',
			glyphPrefix: 'mf'
		}, props ) );
	},
	/**
	 * Gets a filled watch star icon.
	 *
	 * @memberof icons
	 * @instance
	 * @param {Object} props
	 * @return {IconButton}
	 */
	watched: function ( props = {} ) {
		props.additionalClassNames = props.additionalClassNames || '';
		props.additionalClassNames += ' watch-this-article watched';

		return new this.IconButton( util.extend( {
			icon: 'unStar-progressive',
			glyphPrefix: 'mf'
		}, props ) );
	}
};
