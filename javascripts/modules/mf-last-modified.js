( function( M, $ ) {

var module = ( function() {
	var units = ['seconds', 'minutes', 'hours', 'days', 'months', 'years'],
		limits = [1, 60, 3600, 86400, 2592000, 31536000];

	function timeAgo( timestampDelta ) {
		var i = 0;
		while ( i < limits.length && timestampDelta > limits[i + 1] ) {
			++i;
		}
		return { value: Math.round( timestampDelta / limits[i] ), unit: units[i] };
	}

	/**
	 * Initialisation function for last modified module.
	 *
	 * Enhances #mw-mf-last-modified element
	 * to show a human friendly date in seconds, minutes, hours, days
	 * months or years
	 *
	 */
	function init() {
		var $lastModified = $( '#mw-mf-last-modified' ),
			keys = {
				seconds: 'mobile-frontend-last-modified-seconds',
				minutes: 'mobile-frontend-last-modified-minutes',
				hours: 'mobile-frontend-last-modified-hours',
				days: 'mobile-frontend-last-modified-days',
				months: 'mobile-frontend-last-modified-months',
				years: 'mobile-frontend-last-modified-years'
			},
			pageTimestamp = parseInt( $lastModified.data( 'timestamp' ), 10 ),
			currentTimestamp = Math.round( new Date().getTime() / 1000 ),
			delta = timeAgo( currentTimestamp - pageTimestamp ),
			message = mw.msg( keys[ delta.unit ], delta.value );

		$lastModified.text( message );
	}

	return {
		timeAgo: timeAgo,
		init: init
	};
}() );

M.define( 'last-modified', module );

}( mw.mobileFrontend, jQuery ) );
