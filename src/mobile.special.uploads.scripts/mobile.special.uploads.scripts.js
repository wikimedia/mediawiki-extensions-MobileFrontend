/* global $ */
var
	user = mw.user,
	PhotoList = require( './PhotoList' ),
	eventBus = require( '../mobile.startup/eventBusSingleton' ),
	pageParams = mw.config.get( 'wgPageName' ).split( '/' ),
	currentUserName = user.getName(),
	corsUrl = mw.config.get( 'wgMFPhotoUploadEndpoint' ) || undefined,
	userName = pageParams[1] ? pageParams[1] : currentUserName;

/**
 * Initialise a photo upload button at the top of the page.
 * @param {mw.Api} api
 */
function init( api ) {
	// check there are no errors on the page before attempting
	// we might have an invalid username
	if ( $( '.errorbox' ).length === 0 ) {
		new PhotoList( {
			url: corsUrl,
			api: api,
			username: userName,
			eventBus: eventBus
		} ).appendTo( '#mw-content-text .content' );
	}
}

// Assume we are on the special page.
if ( userName ) {
	$( function () {
		init( new mw.Api() );
	} );
}
