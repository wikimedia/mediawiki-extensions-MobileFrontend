var
	View = require( './View' ),
	mfExtend = require( './mfExtend' );

/**
 * @class MessageBox
 * @extends View
 */
function MessageBox() {
	View.apply( this, arguments );
}

mfExtend( MessageBox, View, {
	/**
	 * @inheritdoc
	 * @memberof MessageBox
	 * @instance
	 */
	isTemplateMode: true,
	/**
	 * @memberof MessageBox
	 * @instance
	 * @mixes View#defaults
	 * @property {Object} defaults Default options hash.
	 * @property {string} [defaults.heading] heading to show along with message (text)
	 * @property {string} defaults.msg message to show (html)
	 * @property {string} defaults.className either errorbox, warningbox or successbox
	 */
	defaults: {},
	/**
	 * @memberof MessageBox
	 * @instance
	 */
	template: mw.template.get( 'mobile.startup', 'MessageBox.hogan' )
} );

module.exports = MessageBox;
