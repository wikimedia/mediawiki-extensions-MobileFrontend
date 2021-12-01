const AddTopicForm = require( './AddTopicForm' ),
	autosign = require( './autosign' );

/**
 * Backwards compatible method for obtaining a TalkOverlay
 * used by Minerva until it updates itself.
 *
 * @param {Object} options Configuration options
 * @param {string} options.licenseMsg license text (HTML strings accepted)
 * @param {Function} [options.onTextInput] callback for when text changes
 * @param {string} options.subject to prefill form with
 * @param {string} options.body to prefill form with
 * @param {boolean} options.disabled to mark the form inputs as disabled
 * @return {AddTopicForm}
 */
function makeAddTopicForm( { licenseMsg, onTextInput, subject, body, disabled } ) {
	const form = new AddTopicForm( {
		licenseMsg,
		disabled,
		subject,
		body,
		onTextInput: onTextInput ? function ( sub, bd ) {
			// if the body has content, autosign it!
			if ( bd ) {
				bd = autosign( bd );
			}
			// propagate up the autosigned content
			onTextInput.call( this, sub, bd );
		} : undefined
	} );
	return form;
}

module.exports = makeAddTopicForm;
