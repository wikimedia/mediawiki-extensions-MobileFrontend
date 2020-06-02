var
	View = require( './View' ),
	util = require( './util' );

/**
 * A wrapper for creating an anchor.
 *
 * @extends View
 */
class Anchor extends View {
	/**
	 * @inheritdoc
	 */
	get isTemplateMode() {
		return true;
	}
	/**
	 * @memberof Anchor
	 * @instance
	 * @mixes View#defaults
	 * @property {Object} defaults Default options hash.
	 * @property {boolean} defaults.progressive is progressive action
	 * @property {boolean} defaults.destructive is destructive action
	 * @property {string} defaults.additionalClassNames Additional class name(s).
	 * @property {string} defaults.href url
	 * @property {string} defaults.label of anchor
	 */
	get defaults() {
		return {
			progressive: undefined,
			destructive: undefined,
			additionalClassNames: '',
			href: undefined,
			label: undefined
		};
	}
	/**
	 * @inheritdoc
	 */
	get template() {
		return util.template( `
<a {{#href}}href="{{href}}"{{/href}} class="mw-ui-anchor
	{{#progressive}} mw-ui-progressive{{/progressive}}
	{{#destructive}} mw-ui-destructive{{/destructive}}
	 {{additionalClassNames}}">{{label}}</a>
	` );
	}
}

module.exports = Anchor;
