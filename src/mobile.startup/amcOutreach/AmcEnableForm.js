const
	Button = require( '../Button' ),
	util = require( '../util' ),
	View = require( '../View' );

/**
 * @typedef {Object} FormField
 * @private
 * @property {string} name
 * @property {string} value
 */

/**
 * A form for enabling the advanced mobile editor mode.
 *
 * @param {Object} options
 * @param {string} options.postUrl Form will POST to this endpoint
 * @param {FormField[]} options.fields An array of hidden form fields
 * @param {string} options.buttonLabel Label for submit button
 * submitted
 * @extends module:mobile.startup/View
 * @ignore
 */
class AmcEnableForm extends View {
	/** @inheritdoc */
	get isTemplateMode() {
		return true;
	}

	/** @inheritdoc */
	get template() {
		return util.template( `
<form class="amc-enable-form" action="{{postUrl}}" method="POST">
	{{#fields}}
		<input type="hidden" name="{{name}}" value="{{value}}">
	{{/fields}}
</form>
		` );
	}

	/** @inheritdoc */
	postRender() {
		this.$el.append(
			new Button( {
				tagName: 'button',
				progressive: true,
				label: this.options.buttonLabel
			} ).$el
		);
	}
}

module.exports = AmcEnableForm;
