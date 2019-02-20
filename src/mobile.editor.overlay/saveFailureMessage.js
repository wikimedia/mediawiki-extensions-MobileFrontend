/**
 * Build a save failure message from the API response
 * @param {Object} data Details about the failure, from EditorGateway.parseSaveError
 * @return {string} message describing the failure for display to the user
 */
module.exports = function saveFailureMessage( data ) {
	var key = data && data.details && data.details.code,
		// When save failed with one of these error codes, the returned
		// message in response.error.info will be forwarded to the user.
		// FIXME: This shouldn't be needed when info texts are all localized.
		whitelistedErrorInfo = [
			'blocked',
			'autoblocked'
		];
	if ( data.type === 'readonly' ) {
		return data.details.readonlyreason;
	}
	if ( key === 'editconflict' ) {
		return mw.msg( 'mobile-frontend-editor-error-conflict' );
	} else if ( whitelistedErrorInfo.indexOf( key ) > -1 ) {
		return data.error.info;
	}
	return mw.msg( 'mobile-frontend-editor-error' );
};
