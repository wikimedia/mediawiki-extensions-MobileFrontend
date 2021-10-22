var
	mfExtend = require( './mfExtend' ),
	util = require( './util' ),
	View = require( './View' );

/**
 * A wrapper for creating an icon.
 *
 * @class Icon
 * @extends View
 *
 * @param {Object} options Configuration options
 */
function Icon( options ) {
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
		this.options._rotationClass = this.getRotationClass();
		this.options._iconClasses = this.getIconClasses();
	},
	/**
	 * Internal method that sets the correct rotation class for the icon
	 * based on the value of rotation
	 *
	 * @memberof Icon
	 * @instance
	 * @private
	 */
	getRotationClass: function () {
		var rotationClass = '';
		if ( this.options.rotation ) {
			switch ( this.options.rotation ) {
				case -180:
				case 180:
					rotationClass = 'mf-mw-ui-icon-rotate-flip';
					break;
				case -90:
					rotationClass = 'mf-mw-ui-icon-rotate-anti-clockwise';
					break;
				case 90:
					rotationClass = 'mf-mw-ui-icon-rotate-clockwise';
					break;
				case 0:
					break;
				default:
					throw new Error( 'Bad value for rotation given. Must be ±90, 0 or ±180.' );
			}
		}
		return rotationClass;
	},
	/**
	 * Set icon glyph class and icon type class
	 *
	 * @memberof Icon
	 * @instance
	 * @private
	 */
	getIconClasses: function () {
		var base = this.options.base;
		var name = this.options.name;
		var type = this.options.type;
		var additionalClassNames = this.options.additionalClassNames;

		var modifiers = '';
		if ( type ) {
			modifiers += base + '-' + type + ' ';
		}
		if ( name ) {
			modifiers += this.getGlyphClassName();
		}
		if ( type === 'element' ) {
			additionalClassNames += ' mw-ui-button mw-ui-quiet';
		}

		return base + ' ' + modifiers + ' ' + additionalClassNames;
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
	 * @property {boolean} defaults.isSmall Whether the icon should be small.
	 * @property {string} [defaults.href] value of href attribute,
	 *  when set tagName will default to anchor tag
	 * @property {string} defaults.tagName The name of the tag in which the icon is wrapped.
	 *  Defaults to 'a' when href option present.
	 * @property {string} defaults.base String used as a base for generating class names.
	 * Defaults to 'mw-ui-icon'.
	 * @property {string} defaults.name Name of the icon.
	 * @property {string} defaults.type Icon type
	 * Defaults to 'element'.
	 * @property {string} defaults.title Tooltip text.
	 * @property {string} defaults.additionalClassNames Additional classes to be added to the icon.
	 * @property {boolean} defaults.rotation will rotate the icon by a certain number
	 *  of degrees.
	 *  Must be ±90, 0 or ±180 or will throw exception.
	 * @property {boolean} defaults.disabled should only be used with tagName button
	 */
	defaults: {
		rotation: 0,
		href: undefined,
		glyphPrefix: 'mf',
		tagName: 'div',
		disabled: false,
		isSmall: false,
		base: 'mw-ui-icon',
		name: '',
		type: 'element',
		title: '',
		additionalClassNames: ''
	},
	/**
	 * Return the full class name that is required for the icon to render
	 *
	 * @memberof Icon
	 * @instance
	 * @return {string}
	 */
	getClassName: function () {
		return this.$el.attr( 'class' );
	},
	/**
	 * Return the class that relates to the icon glyph
	 *
	 * @memberof Icon
	 * @instance
	 * @return {string}
	 */
	getGlyphClassName: function () {
		if ( this.options.glyphPrefix ) {
			return this.options.base + '-' + this.options.glyphPrefix + '-' + this.options.name;
		}
		return this.options.base + '-' + this.options.name;
	},
	template: util.template(
		'<{{tagName}} ' +
			'{{#isTypeButton}}type="button" {{#disabled}}disabled{{/disabled}}{{/isTypeButton}} ' +
			'class="{{_iconClasses}} ' +
				'{{#isSmall}}mw-ui-icon-small{{/isSmall}} ' +
				'{{#_rotationClass}}{{_rotationClass}}{{/_rotationClass}}" ' +
			'{{#id}}id="{{id}}"{{/id}} ' +
			'{{#href}}href="{{href}}"{{/href}} ' +
			'{{#title}}title="{{title}}"{{/title}}>' +
				'{{label}}' +
		'</{{tagName}}>'
	)
} );

module.exports = Icon;
