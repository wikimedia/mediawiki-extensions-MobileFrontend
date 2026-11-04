const mobile = require( 'mobile.startup' );
const { headers, spinner, cancelIcon } = mobile;
const { Button, IconButton } = mobile.class;
const { header } = headers;

/**
 * Gets a back icon.
 *
 * @ignore
 * @return {IconButton}
 */
const backButton = () => new IconButton( {
	icon: 'previous',
	additionalClassNames: 'back',
	label: mw.msg( 'mobile-frontend-overlay-close' )
} );

/**
 * Obtains the correct label for the save button which is project specific. It's either
 * "save" or "publish"
 *
 * @ignore
 * @return {string}
 */
const saveButtonMessage = () => mw.config.get( 'wgEditSubmitButtonLabelPublish' ) ?
	mw.msg( 'mobile-frontend-editor-publish' ) : mw.msg( 'mobile-frontend-editor-save' );

/**
 * Creates a header with a form
 *
 * @ignore
 * @param {string} heading (HTML allowed)
 * @param {string} additionalClassNames of the header
 * @return {Element}
 */
function saveHeader( heading, additionalClassNames ) {
	return header(
		heading,
		[
			new Button( {
				tagName: 'button',
				additionalClassNames: 'save submit',
				disabled: true,
				label: saveButtonMessage(),
				size: 'large'
			} )
		],
		backButton(),
		additionalClassNames
	);
}
/**
 * Creates a header while editor is saving.
 *
 * @ignore
 * @param {string} heading (HTML allowed)
 * @return {Element}
 */
function savingHeader( heading ) {
	return header(
		heading,
		[
			spinner( {
				additionalClassNames: 'savespinner loading'
			} )
		],
		cancelIcon(),
		'saving-header hidden'
	);
}

module.exports = Object.assign( {
	saveHeader,
	savingHeader
}, headers );
