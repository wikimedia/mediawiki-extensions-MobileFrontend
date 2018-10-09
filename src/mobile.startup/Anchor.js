var
	View = require( './View' ),
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
	 */
	template: mw.template.get( 'mobile.startup', 'anchor.hogan' )
} );

module.exports = Anchor;
