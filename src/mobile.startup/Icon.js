var
	mfExtend = require( './mfExtend' ),
	util = require( './util' ),
	View = require( './View' );

/**
 * A wrapper for creating an icon.
 * @class Icon
 * @extends View
 *
 * @param {Object} options Configuration options
 */
function Icon( options ) {
	if ( options.hasText ) {
		options.modifier = `mw-ui-icon-before ${options.modifier || ''}`;
	}
	if ( options.href ) {
		options.tagName = 'a';
	}
	if ( options.tagName === 'button' ) {
		options.isTypeButton = true;
	}
	View.call( this, options );
}

mfExtend( Icon, View, {
	/**
	 * @inheritdoc
	 * @memberof Icon
	 * @instance
	 */
	preRender: function () {
		this.setRotationClass();
	},
	/**
	 * Internal method that sets the correct rotation class for the icon
	 * based on the value of rotation
	 * @memberof Icon
	 * @instance
	 * @private
	 */
	setRotationClass: function () {
		var options = this.options;
		if ( options.rotation ) {
			switch ( options.rotation ) {
				case -180:
				case 180:
					options._rotationClass = 'mf-mw-ui-icon-rotate-flip';
					break;
				case -90:
					options._rotationClass = 'mf-mw-ui-icon-rotate-anti-clockwise';
					break;
				case 90:
					options._rotationClass = 'mf-mw-ui-icon-rotate-clockwise';
					break;
				case 0:
					break;
				default:
					throw new Error( 'Bad value for rotation given. Must be ±90, 0 or ±180.' );
			}
		}
	},
	/**
	 * @inheritdoc
	 * @memberof Icon
	 * @instance
	 */
	isTemplateMode: true,
	/**
	 * @memberof Icon
	 * @instance
	 * @mixes View#defaults
	 * @property {Object} defaults Default options hash.
	 * @property {boolean} defaults.hasText Whether the icon has text.
	 * @property {boolean} defaults.isSmall Whether the icon should be small.
	 * @property {string} [defaults.href] value of href attribute,
	 *  when set tagName will default to anchor tag
	 * @property {string} defaults.tagName The name of the tag in which the icon is wrapped.
	 *  Defaults to 'a' when href option present.
	 * @property {string} defaults.base String used as a base for generating class names.
	 * Defaults to 'mw-ui-icon'.
	 * @property {string} defaults.name Name of the icon.
	 * @property {string} defaults.modifier Additional class name.
	 * Defaults to 'mw-ui-icon-element'.
	 * @property {string} defaults.title Tooltip text.
	 * @property {boolean} defaults.rotation will rotate the icon by a certain number
	 *  of degrees.
	 *  Must be ±90, 0 or ±180 or will throw exception.
	 */
	defaults: {
		rotation: 0,
		hasText: false,
		href: undefined,
		glyphPrefix: 'mf',
		tagName: 'div',
		isSmall: false,
		base: 'mw-ui-icon',
		name: '',
		modifier: 'mw-ui-icon-element',
		title: ''
	},
	/**
	 * Return the full class name that is required for the icon to render
	 * @memberof Icon
	 * @instance
	 * @return {string}
	 */
	getClassName: function () {
		return this.$el.attr( 'class' );
	},
	/**
	 * Return the class that relates to the icon glyph
	 * @memberof Icon
	 * @instance
	 * @return {string}
	 */
	getGlyphClassName: function () {
		return this.options.base + '-' + this.options.glyphPrefix + '-' + this.options.name;
	},
	/**
	 * Return the HTML representation of this view. Deprecated for reasons given in T149909.
	 * @memberof Icon
	 * @instance
	 * @deprecated
	 * @return {string}
	 */
	toHtmlString: function () {
		return this.parseHTML( '<div>' ).append( this.$el ).html();
	},
	template: util.template(
		'<{{tagName}} ' +
			'{{#isTypeButton}}type="button"{{/isTypeButton}} ' +
			'class="{{base}} ' +
				'{{base}}-{{glyphPrefix}}-{{name}} ' +
				'{{modifier}} ' +
				'{{#isSmall}}mw-ui-icon-small{{/isSmall}} ' +
				'{{#_rotationClass}}{{_rotationClass}}{{/_rotationClass}} ' +
				'{{additionalClassNames}}" ' +
			'{{#id}}id="{{id}}"{{/id}} ' +
			'{{#href}}href="{{href}}"{{/href}} ' +
			'{{#title}}title="{{title}}"{{/title}}>' +
			'{{#hasText}}<span>{{/hasText}}' +
				'{{label}}' +
			'{{#hasText}}</span>{{/hasText}}' +
		'</{{tagName}}>'
	)
} );

mw.log.deprecate( Icon.prototype, 'toHtmlString', Icon.prototype.toHtmlString );
module.exports = Icon;
