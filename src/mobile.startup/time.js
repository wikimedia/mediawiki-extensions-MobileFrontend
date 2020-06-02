var units = [ 'seconds', 'minutes', 'hours', 'days', 'months', 'years' ],
	util = require( './util' ),
	limits = [ 1, 60, 3600, 86400, 2592000, 31536000 ];

/** @class time */

/**
 * Calculate the correct unit of timestamp
 *
 * @memberof time
 * @instance
 * @param {number} timestampDelta
 * @return {{value: number, unit: string}}
 */
function timeAgo( timestampDelta ) {
	var i = 0;
	while ( i < limits.length && timestampDelta > limits[i + 1] ) {
		++i;
	}
	return {
		value: Math.round( timestampDelta / limits[i] ),
		unit: units[i]
	};
}

/**
 * Calculate the correct unit of timestamp delta
 *
 * @memberof time
 * @instance
 * @param {number} timestamp
 * @return {{value: number, unit: string}}
 */
function getTimeAgoDelta( timestamp ) {
	var currentTimestamp = Math.round( new Date().getTime() / 1000 );

	return timeAgo( currentTimestamp - timestamp );
}

/**
 * Whether timestamp delta is less than a day old
 *
 * @memberof time
 * @instance
 * @param {{value: number, unit: string}} delta Object of timestamp and its label
 * @return {boolean}
 */
function isRecent( delta ) {
	return [ 'seconds', 'minutes', 'hours' ].indexOf( delta.unit ) > -1;
}

/**
 * Is delta less than 10 seconds?
 *
 * @memberof time
 * @instance
 * @param {{value: number, unit: string}} delta Object of timestamp and its label
 * @return {boolean}
 */
function isNow( delta ) {
	return delta.unit === 'seconds' && delta.value < 10;
}

/**
 * Return a message relating to the last modified relative time.
 *
 * @memberof time
 * @instance
 * @param {number} ts timestamp
 * @param {string} username of the last user to modify the page
 * @param {string} [gender] of the last user to modify the page
 * @param {string} [historyUrl] url to the history page for the message, if omitted
 *  returns plain text string rather than html
 * @return {string}
 */
function getLastModifiedMessage( ts, username, gender, historyUrl ) {
	var delta, html,
		keys = {
			seconds: 'mobile-frontend-last-modified-with-user-seconds',
			minutes: 'mobile-frontend-last-modified-with-user-minutes',
			hours: 'mobile-frontend-last-modified-with-user-hours',
			days: 'mobile-frontend-last-modified-with-user-days',
			months: 'mobile-frontend-last-modified-with-user-months',
			years: 'mobile-frontend-last-modified-with-user-years'
		},
		args = [];

	gender = gender || 'unknown';

	delta = getTimeAgoDelta( ts );
	if ( isNow( delta ) ) {
		args.push( 'mobile-frontend-last-modified-with-user-just-now', gender, username );
	} else {
		args.push( keys[ delta.unit ], gender, username,
			mw.language.convertNumber( delta.value )
		);
	}

	args.push(
		historyUrl || '#',
		// Abuse PLURAL support to determine if the user is anonymous or not
		mw.language.convertNumber( username ? 1 : 0 ),
		// Our abuse of PLURAL support means we have to pass the relative URL
		// rather than construct it from a wikilink
		username ? mw.util.getUrl( 'User:' + username ) : ''
	);
	html = mw.message.apply( this, args ).parse();
	if ( historyUrl ) {
		return html;
	} else {
		return util.parseHTML( '<div>' ).html( html ).text();
	}
}

/**
 * Return a message relating to the registration date of the user
 *
 * @memberof time
 * @instance
 * @param {string} ts timestamp
 * @param {string} [gender] of the last user editing this page
 * @return {string}
 */
function getRegistrationMessage( ts, gender ) {
	var delta, html,
		keys = {
			seconds: 'mobile-frontend-joined-seconds',
			minutes: 'mobile-frontend-joined-minutes',
			hours: 'mobile-frontend-joined-hours',
			days: 'mobile-frontend-joined-days',
			months: 'mobile-frontend-joined-months',
			years: 'mobile-frontend-joined-years'
		},
		args = [];

	gender = gender || 'unknown';

	delta = getTimeAgoDelta( parseInt( ts, 10 ) );
	if ( isNow( delta ) ) {
		args.push( 'mobile-frontend-joined-just-now', gender );
	} else {
		args.push( keys[ delta.unit ], gender, mw.language.convertNumber( delta.value ) );
	}
	html = mw.message.apply( this, args ).parse();
	return html;
}

module.exports = {
	getLastModifiedMessage: getLastModifiedMessage,
	getRegistrationMessage: getRegistrationMessage,
	timeAgo: timeAgo,
	getTimeAgoDelta: getTimeAgoDelta,
	isNow: isNow,
	isRecent: isRecent
};
