var
	View = require( './View' ),
	util = require( './util' ),
	mfExtend = require( './mfExtend' );

/**
 * A wrapper for creating an anchor.
 * @class Anchor
 * @extends View
 */
function Anchor() {
	View.apply( this, arguments );
}

mfExtend( Anchor, View, {
	/**
	 * @inheritdoc
	 * @memberof Anchor
	 * @instance
	 */
	isTemplateMode: true,
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
	defaults: {
		progressive: undefined,
		destructive: undefined,
		additionalClassNames: '',
		href: undefined,
		label: undefined
	},
	/**
	 * @inheritdoc
	 * @memberof Anchor
	 * @instance
	 * FIXME: Simplify this template and its whitespace
	 */
	template: util.template( `
<a {{#href}}href="{{href}}"{{/href}} class="mw-ui-anchor
	{{#progressive}} mw-ui-progressive{{/progressive}}
	{{#destructive}} mw-ui-destructive{{/destructive}}
	 {{additionalClassNames}}">{{label}}</a>
	` )
} );

module.exports = Anchor;
