const
	mfExtend = require( '../mobile.startup/mfExtend' ),
	View = require( '../mobile.startup/View' ),
	util = require( '../mobile.startup/util' );

/**
 * Create a panel with a child
 * @param {jQuery.Object} $child
 * @return {Panel}
 */
function makePanel( $child ) {
	const panel = new View( { className: 'panel' } );
	panel.$el.append( $child );
	return panel;
}

/**
 * Form for adding a talk section
 * @class AddTopicForm
 * @extends View
 *
 * @param {Object} options Configuration options
 * @param {string} options.licenseMsg license text (HTML strings accepted)
 * @param {Function} options.onTextInput callback for when text changes
 * @param {string} options.subject to prefill form with
 * @param {string} options.body to prefill form with
 * @param {boolean} options.disabled to mark the form inputs as disabled
 */
function AddTopicForm( options ) {
	View.call( this,
		util.extend( options, {
			// Template properties
			topicTitlePlaceHolder: mw.msg( 'mobile-frontend-talk-add-overlay-subject-placeholder' ),
			topicContentPlaceHolder: mw.msg( 'mobile-frontend-talk-add-overlay-content-placeholder' ),

			// Additional data
			className: 'add-topic-form',
			events: {
				'input .wikitext-editor, input': 'onTextInput',
				'change .wikitext-editor, input': 'onTextInput'
			}
		} )
	);
}

mfExtend( AddTopicForm, View, {
	/**
	 * @inheritdoc
	 * @memberof AddTopicForm
	 * @instance
	 */
	postRender: function () {
		const options = this.options,
			disabled = options.disabled,
			$subject = util.parseHTML( '<input>' ).attr( {
				class: 'mw-ui-input',
				type: 'text',
				disabled,
				value: options.subject,
				placeholder: options.topicTitlePlaceHolder
			} ),
			$body = util.parseHTML( '<textarea>' ).attr( {
				class: 'wikitext-editor mw-ui-input',
				cols: 40,
				rows: 10,
				disabled,
				placeholder: options.topicContentPlaceHolder
			} ).val( options.body ),
			panels = [
				makePanel( util.parseHTML( '<p>' ).addClass( 'license' ).html( options.licenseMsg ) ),
				makePanel( $subject ),
				makePanel( $body )
			];

		this.$el.append(
			panels.map( function ( panel ) {
				return panel.$el;
			} )
		);
		this.$subject = $subject;
		this.$messageBody = $body;
		View.prototype.postRender.apply( this, arguments );
	},
	/**
	 * Handles an input into a textarea and enables or disables the submit button
	 * @memberof AddTopicForm
	 * @instance
	 */
	onTextInput: function () {
		if ( this.options.onTextInput ) {
			this.options.onTextInput( this.$subject.val().trim(), this.$messageBody.val().trim() );
		}
	}
} );

AddTopicForm.test = {
	makePanel
};

module.exports = AddTopicForm;
