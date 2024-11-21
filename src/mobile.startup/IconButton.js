const
	util = require( './util' ),
	View = require( './View' ),
	Icon = require( './Icon' );

/**
 * A wrapper for creating an icon button.
 */
class IconButton extends View {
	/**
	 * @param {Object} options Configuration options
	 */
	constructor( options ) {
		if ( options.href ) {
			options.tagName = 'a';
		}
		if ( options.tagName === 'button' ) {
			options.isTypeButton = true;
		}
		super( options );
	}

	/**
	 * @inheritdoc
	 */
	preRender() {
		this.options._buttonClasses = this.getButtonClasses();
		this.options._iconHTML = '';
		if ( this.options.icon ) {
			this._icon = new Icon( {
				base: this.options.base,
				glyphPrefix: this.options.glyphPrefix,
				icon: this.options.icon,
				rotation: this.options.rotation,
				isSmall: this.options.isSmall
			} );
			this.options._iconHTML = this._icon.$el.get( 0 ).outerHTML;
		}
	}

	getButtonClasses() {
		const additionalClassNames = this.options.additionalClassNames;
		const size = this.options.size;
		const weight = this.options.weight;
		const action = this.options.action;
		const isIconOnly = this.options.isIconOnly;
		let classes = 'cdx-button ';

		if ( this.options.tagName !== 'button' ) {
			classes += 'cdx-button--fake-button cdx-button--fake-button--enabled ';
		}
		if ( size ) {
			classes += `cdx-button--size-${ size } `;
		}
		if ( weight ) {
			classes += `cdx-button--weight-${ weight } `;
		}
		if ( action ) {
			classes += `cdx-button--action-${ action } `;
		}
		if ( isIconOnly ) {
			classes += 'cdx-button--icon-only ';
		}
		return classes + additionalClassNames;
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
	 *  Defaults to 'a' when href option present.
	 * @property {string} [defaults.href] value of href attribute,
	 *  when set tagName will default to anchor tag
	 * @property {string} defaults.additionalClassNames Additional classes to be added to the button
	 * @property {string} defaults.title Tooltip text.
	 * @property {string} defaults.size Button size.
	 * Defaults to 'large'.
	 * @property {boolean} defaults.weight Button weight.
	 * Defaults to 'quiet'.
	 * @property {boolean} defaults.action Button action.
	 * @property {boolean} defaults.isIconOnly Whether button is an icon only button
	 * Defaults to true.
	 * @property {boolean} defaults.disabled should only be used with tagName button
	 * @property {string} defaults.base String used as a base for generating class names.
	 * Defaults to 'mf-icon'.
	 * @property {string} defaults.glyphPrefix Prefix for the icon class
	 * @property {string} defaults.icon Name of the icon.
	 * @property {boolean} defaults.rotation will rotate the icon by a certain number
	 *  of degrees. Must be ±90, 0 or ±180 or will throw exception.
	 * @property {boolean} defaults.isSmall Whether the icon should be small.
	 */
	get defaults() {
		return {
			tagName: 'button',
			href: undefined,
			additionalClassNames: '',
			title: '',
			size: 'large',
			weight: 'quiet',
			action: '',
			isIconOnly: true,
			disabled: false,
			base: 'mf-icon',
			icon: '',
			rotation: 0,
			isSmall: false
		};
	}

	/**
	 * Return the full class name that is required for the icon to render
	 *
	 * @return {string}
	 */
	getClassName() {
		return this.$el.attr( 'class' );
	}

	getIcon() {
		return this._icon;
	}

	get template() {
		return util.template( `
		<{{tagName}}
			type="button"
			{{#isTypeButton}}{{#disabled}}disabled{{/disabled}}{{/isTypeButton}}
			class="{{_buttonClasses}}"
			{{#id}}id="{{id}}"{{/id}}
			{{#href}}href="{{href}}"{{/href}}
			{{#title}}title="{{title}}"{{/title}}>
				{{{_iconHTML}}}
				<span>{{label}}</span>
		</{{tagName}}>
		` );
	}
}

module.exports = IconButton;
