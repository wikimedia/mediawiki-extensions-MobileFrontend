const
	CANCEL_GLYPH = 'close',
	Icon = require( './Icon' ),
	IconButton = require( './IconButton' );

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
const icons = {
	CANCEL_GLYPH,
	// Exported to support testing and stubbing
	Icon,
	IconButton,
	/**
	 * Gets a back icon
	 *
	 * The icon should be used to inform the user that the front-end is
	 * communicating with the back-end.
	 *
	 * @return {IconButton}
	 */
	back() {
		return new icons.IconButton( {
			tagName: 'button',
			icon: 'previous',
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
	 * @param {string} [variant]
	 * @param {Object} [props] to extend
	 * @return {IconButton}
	 */
	cancel( variant, props = {} ) {
		const glyph = variant ? `${ CANCEL_GLYPH }-${ variant }` : `${ CANCEL_GLYPH }`;
		props.additionalClassNames = props.additionalClassNames || '';
		props.additionalClassNames += ' cancel';

		return new icons.IconButton( Object.assign( {
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
	 * @param {Object} [props] See `Icon` for more details
	 * @return {IconButton}
	 */
	spinner( props = {} ) {
		if ( props.additionalClassNames === undefined ) {
			props.additionalClassNames = 'spinner loading';
		}

		const spinner = new icons.IconButton( Object.assign( {
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
			spinner.$el.addClass( 'mf-spinner-icon-element' );
		}
		return spinner;
	},
	/**
	 * Gets a failure (error) icon
	 *
	 * @return {IconButton}
	 */
	error() {
		return new icons.IconButton( {
			icon: 'alert-invert',
			additionalClassNames: 'load-fail-msg-icon'
		} );
	},
	/**
	 * Gets a non-filled watch star icon.
	 *
	 * @param {Object} props
	 * @return {IconButton}
	 */
	watch( props = {} ) {
		props.additionalClassNames = props.additionalClassNames || '';
		props.additionalClassNames += ' watch-this-article';

		return new icons.IconButton( Object.assign( {
			icon: 'star-subtle'
		}, props ) );
	},
	/**
	 * Gets a filled watch star icon.
	 *
	 * @param {Object} props
	 * @return {IconButton}
	 */
	watched( props = {} ) {
		props.additionalClassNames = props.additionalClassNames || '';
		props.additionalClassNames += ' watch-this-article watched';

		return new icons.IconButton( Object.assign( {
			icon: 'unStar-progressive'
		}, props ) );
	}
};

module.exports = icons;
