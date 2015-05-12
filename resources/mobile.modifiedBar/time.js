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

	M.define( 'modules/lastEdited/time', {
		timeAgo: timeAgo,
		getTimeAgoDelta: getTimeAgoDelta,
		isNow: isNow,
		isRecent: isRecent
	} );

}( mw.mobileFrontend, jQuery ) );
