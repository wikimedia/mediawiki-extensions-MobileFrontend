const
	View = require( './View' ),
	util = require( './util' ),
	mfExtend = require( './mfExtend' );

/**
 * Render CSS version of Codex message component.
 *
 * @class MessageBox
 * @extends module:mobile.startup/View
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
	 * @mixes module:mobile.startup/View#defaults
	 * @property {Object} defaults Default options hash.
	 * @property {string} [defaults.heading] heading to show along with message (text)
	 * @property {string} defaults.msg message to show (html)
	 * @property {string} defaults.type either error, notice or warning
	 * @property {string} defaults.className
	 */
	defaults: {},
	/**
	 * @memberof MessageBox
	 * @instance
	 */
	template: util.template( `
<div
  class="cdx-message cdx-message--block cdx-message--{{type}} {{className}}"
  aria-live="polite"
>
  <!-- Empty span for message icon. -->
  <span class="cdx-message__icon"></span>
  <!-- Div for content. -->
  <div class="cdx-message__content">
  {{#heading}}<h2>{{heading}}</h2>{{/heading}}
  {{{msg}}}
  </div>
</div>
	` )
} );

module.exports = MessageBox;
