var
	mfExtend = require( './mfExtend' ),
	util = require( './util' ),
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
	 * @property {boolean} defaults.quiet is quiet button
	 * @property {boolean} defaults.destructive is destructive action
	 * @property {string} defaults.additionalClassNames Additional class name(s).
	 * @property {string} defaults.href url
	 * @property {string} defaults.label of button
	 * @property {boolean} defaults.disabled should only be used with tagName button
	 */
	defaults: {
		tagName: 'a',
		disabled: false,
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
	template: util.template( `<{{tagName}} {{#disabled}}disabled{{/disabled}}
{{#href}}href="{{href}}"{{/href}}
class="mw-ui-button {{#progressive}}mw-ui-progressive{{/progressive}}
	{{#block}}mw-ui-block{{/block}}
	{{#quiet}}mw-ui-quiet{{/quiet}}
	{{#destructive}}mw-ui-destructive{{/destructive}} {{additionalClassNames}}
">{{label}}</{{tagName}}>` )
} );

module.exports = Button;
