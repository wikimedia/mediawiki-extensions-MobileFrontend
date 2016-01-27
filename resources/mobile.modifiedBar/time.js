( function ( M, $ ) {
	var units = [ 'seconds', 'minutes', 'hours', 'days', 'months', 'years' ],
		limits = [ 1, 60, 3600, 86400, 2592000, 31536000 ];

	/**
	 * Calculate the correct unit of timestamp
	 * @param {Number} timestampDelta
	 * @returns {{value: Number, unit: String}}
	 * @ignore
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
	 * @param {Number} timestamp
	 * @returns {{value: Number, unit: String}}
	 * @ignore
	 */
	function getTimeAgoDelta( timestamp ) {
		var currentTimestamp = Math.round( new Date().getTime() / 1000 );

		return timeAgo( currentTimestamp - timestamp );
	}

	/**
	 * Whether timestamp delta is less than a day old
	 * @param {{value: Number, unit: String}} delta Object of timestamp and its label
	 * @returns {Boolean}
	 * @ignore
	 */
	function isRecent( delta ) {
		var u = delta.unit;
		return $.inArray( u, [ 'seconds', 'minutes', 'hours' ] ) > -1;
	}

	/**
	 * Is delta less than 10 seconds?
	 * @param {{value: Number, unit: String}} delta Object of timestamp and its label
	 * @returns {Boolean}
	 * @ignore
	 */
	function isNow( delta ) {
		return delta.unit === 'seconds' && delta.value < 10;
	}

	/**
	 * Return a message relating to the last modified relative time.
	 * @param {String} ts timestamp
	 * @param {String} username of the last user to modify the page
	 * @param {String} [gender] of the last user to modify the page
	 * @param {String} [historyUrl] url to the history page for the message, if omitted
	 *  returns plain text string rather than html
	 * @ignore
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

		delta = getTimeAgoDelta( parseInt( ts, 10 ) );
		if ( isNow( delta ) ) {
			args = args.concat( [ 'mobile-frontend-last-modified-with-user-just-now', gender, username ] );
		} else {
			args = args.concat( [ keys[ delta.unit ], gender, username,
				mw.language.convertNumber( delta.value )
			] );
		}

		args = args.concat( [ historyUrl || '#',
			// Abuse PLURAL support to determine if the user is anonymous or not
			mw.language.convertNumber( username ? 1 : 0 ),
			// I'll abuse of PLURAL support means we have to pass the relative URL rather than construct it from a wikilink
			username ? mw.util.getUrl( 'User:' + username ) : ''
		] );
		html = mw.message.apply( this, args ).parse();
		if ( historyUrl ) {
			return html;
		} else {
			return $( '<div>' ).html( html ).text();
		}
	}

	M.define( 'mobile.modifiedBar/time', {
		getLastModifiedMessage: getLastModifiedMessage,
		timeAgo: timeAgo,
		getTimeAgoDelta: getTimeAgoDelta,
		isNow: isNow,
		isRecent: isRecent
	} ).deprecate( 'modules/lastEdited/time' );

}( mw.mobileFrontend, jQuery ) );
