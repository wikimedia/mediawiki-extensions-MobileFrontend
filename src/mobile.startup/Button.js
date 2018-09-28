var
	mfExtend = require( './mfExtend' ),
	View = require( './View' );

/**
 * A wrapper for creating a button.
 * @class Button
 * @extends View
 *
 * @param {Object} options Configuration options
 */
function Button( options ) {
	if ( options.href ) {
		options.tagName = 'a';
	}
	View.call( this, options );
}

mfExtend( Button, View, {
	/**
	 * @inheritdoc
	 * @memberof Button
	 * @instance
	 */
	isTemplateMode: true,
	/**
	 * @memberof Button
	 * @instance
	 * @mixes View#defaults
	 * @property {Object} defaults Default options hash.
	 * @property {string} defaults.tagName The name of the tag in which the button is wrapped.
	 * @property {boolean} defaults.block is stacked button
	 * @property {boolean} defaults.progressive is progressive action
	 *   This option is deprecated. Please use `progressive`.
	 * @property {boolean} defaults.quiet is quiet button
	 * @property {boolean} defaults.destructive is destructive action
	 * @property {string} defaults.additionalClassNames Additional class name(s).
	 * @property {string} defaults.href url
	 * @property {string} defaults.label of button
	 */
	defaults: {
		tagName: 'a',
		block: undefined,
		progressive: undefined,
		destructive: undefined,
		quiet: undefined,
		additionalClassNames: '',
		href: undefined,
		label: undefined
	},
	/**
	 * @memberof Button
	 * @instance
	 */
	template: mw.template.get( 'mobile.startup', 'button.hogan' )
} );

module.exports = Button;
