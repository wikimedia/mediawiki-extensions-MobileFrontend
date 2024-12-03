const
	util = require( './util' ),
	View = require( './View' ),
	IconButton = require( './IconButton' );

/**
 * A wrapper for creating a button.
 * FIXME: T343036 This file should be combined with IconButton, all gadgets/extentions
 * using Button.js and IconButton.js will need to be updated to reflect this
 *
 * @private
 */
class Button extends View {
	/**
	 * @param {Object} options Configuration options
	 */
	constructor( options ) {
		super( options );
	}

	/**
	 * @inheritdoc
	 */
	get isTemplateMode() {
		return true;
	}

	/**
	 * @mixes module:mobile.startup/View#defaults
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
	get defaults() {
		return {
			tagName: 'a',
			disabled: false,
			block: undefined,
			progressive: undefined,
			destructive: undefined,
			quiet: undefined,
			additionalClassNames: '',
			href: undefined,
			label: undefined,
			size: 'medium'
		};
	}

	get template() {
		return util.template( '{{{_buttonHTML}}}' );
	}

	/**
	 * @inheritdoc
	 */
	preRender() {
		// Mapping existing props to Codex props used in IconButton
		let action = 'default';
		if ( this.options.progressive ) {
			action = 'progressive';
		} else if ( this.options.destructive ) {
			action = 'destructive';
		}
		let weight = this.options.quiet ? 'quiet' : 'normal';
		if ( this.options.progressive || this.options.destructive ) {
			weight = 'primary';
		}
		if ( this.options.block ) {
			this.options.additionalClassNames += ' mf-button-block';
		}
		const options = util.extend( {
			weight,
			action,
			isIconOnly: false,
			icon: null
		}, this.options );

		this._button = new IconButton( options );
		this.options._buttonHTML = this._button.$el.get( 0 ).outerHTML;
	}
}

module.exports = Button;
