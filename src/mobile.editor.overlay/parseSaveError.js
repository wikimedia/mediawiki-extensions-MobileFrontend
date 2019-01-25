/**
 * Turn an API response on save failure into a details object
 * @param {Object|null} data API response data
 * @param {string} [code] Text status message from API
 * @return {Object} An object with `type` and `details` properties.
 * `type` is a string describing the type of error, `details` can be any
 * object (usually error message).
*/
function parseSaveError( data, code ) {
	var warning;
	if ( code ) {
		switch ( code ) {
			case 'readonly':
				return {
					type: 'readonly',
					details: data.error
				};
			case 'editconflict':
				return {
					type: 'editconflict',
					details: data.error
				};
			default:
				return {
					type: 'error',
					details: 'http'
				};
		}
	}
	if ( data ) {
		if ( data.error ) {
			// Edit API error
			return {
				type: 'error',
				details: data.error.code
			};
		} else if ( data.edit && data.edit.captcha ) {
			// CAPTCHAs
			return {
				type: 'captcha',
				details: data.edit.captcha
			};
		} else if ( data.edit && data.edit.code ) {
			code = data.edit.code;
			warning = data.edit.warning;

			// FIXME: AbuseFilter should have more consistent API responses
			if ( /^abusefilter-warning/.test( code ) ) {
				// AbuseFilter warning
				return {
					type: 'abusefilter',
					details: {
						type: 'warning',
						message: warning
					}
				};
			} else if ( /^abusefilter-disallow/.test( code ) ) {
				// AbuseFilter disallow
				return {
					type: 'abusefilter',
					details: {
						type: 'disallow',
						message: warning
					}
				};
			} else if ( /^abusefilter/.test( code ) ) {
				// AbuseFilter other
				return {
					type: 'abusefilter',
					details: {
						type: 'other',
						message: warning
					}
				};
			}
			// other errors
			return {
				type: 'error',
				details: code
			};
		}
	}
	return {
		type: 'error',
		details: 'unknown'
	};
}
module.exports = parseSaveError;
