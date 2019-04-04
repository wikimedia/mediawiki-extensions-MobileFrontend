const util = require( '../mobile.startup/util' ),
	MessageBox = require( '../mobile.startup/MessageBox' ),
	nearbyErrors = {
		permission: {
			hasHeading: false,
			msg: mw.msg( 'mobile-frontend-nearby-permission-denied' )
		},
		location: {
			hasHeading: false,
			msg: mw.msg( 'mobile-frontend-nearby-location-unavailable' )
		},
		empty: {
			heading: mw.msg( 'mobile-frontend-nearby-noresults' ),
			hasHeading: true,
			msg: mw.msg( 'mobile-frontend-nearby-noresults-guidance' )
		},
		http: {
			heading: mw.msg( 'mobile-frontend-nearby-error' ),
			hasHeading: true,
			msg: mw.msg( 'mobile-frontend-nearby-error-guidance' )
		},
		incompatible: {
			heading: mw.msg( 'mobile-frontend-nearby-requirements' ),
			hasHeading: true,
			msg: mw.msg( 'mobile-frontend-nearby-requirements-guidance' )
		}
	};

/**
 * @param {string} key of the error that occurred.
 * @return {MessageBox} of a related error. If no match for error key, a generic HTTP error will
 * be displayed.
 */
module.exports = function nearbyErrorMessage( key ) {
	var message = nearbyErrors[ key ] || nearbyErrors.http;

	return new MessageBox(
		util.extend( {
			className: 'errorbox'
		}, message )
	);
};
