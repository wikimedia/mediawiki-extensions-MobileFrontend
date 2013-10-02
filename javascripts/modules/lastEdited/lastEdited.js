( function( M, $ ) {

M.assertMode( [ 'stable' ] );
var module = ( function() {
	var time = M.require( 'modules/lastEdited/time' );

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
			ts = $lastModified.data( 'timestamp' ),
			keys = {
				seconds: 'mobile-frontend-last-modified-seconds',
				minutes: 'mobile-frontend-last-modified-minutes',
				hours: 'mobile-frontend-last-modified-hours',
				days: 'mobile-frontend-last-modified-days',
				months: 'mobile-frontend-last-modified-months',
				years: 'mobile-frontend-last-modified-years'
			},
			message, delta;

		if ( ts ) {
			delta = time.getTimeAgoDelta( parseInt( ts, 10 ) );
			if ( time.isNow( delta ) ) {
				message = mw.msg( 'mobile-frontend-last-modified-just-now' );
			} else {
				message = mw.msg( keys[ delta.unit ], mw.language.convertNumber( delta.value ) );
			}
			$lastModified.text( message );
		}
	}
	M.on( 'page-loaded', init );

	return {
		init: init
	};
}() );

M.define( 'last-modified', module );

}( mw.mobileFrontend, jQuery ) );
