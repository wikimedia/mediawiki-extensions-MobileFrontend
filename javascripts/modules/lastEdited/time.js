( function ( M, $ ) {
	var units = [ 'seconds', 'minutes', 'hours', 'days', 'months', 'years' ],
		limits = [ 1, 60, 3600, 86400, 2592000, 31536000 ];

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

	function getTimeAgoDelta( timestamp ) {
		var currentTimestamp = Math.round( new Date().getTime() / 1000 ),
			delta = timeAgo( currentTimestamp - timestamp );
		return delta;
	}

	function isRecent( delta ) {
		var u = delta.unit;
		return $.inArray( u, [ 'seconds', 'minutes', 'hours' ] ) > -1;
	}

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
