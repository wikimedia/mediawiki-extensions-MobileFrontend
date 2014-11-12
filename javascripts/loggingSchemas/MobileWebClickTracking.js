/**
 * Utility library for tracking clicks on certain elements
 * @class MobileWebClickTracking
 */
( function ( M, $ ) {
	var s = M.require( 'settings' );

	/**
	 * Track an event and record it
	 *
	 * @method
	 * @param {string} name of click tracking event to log
	 * @param {string} [destination] of the link that has been clicked if applicable.
	 */
	function log( name, destination ) {
		var
			user = M.require( 'user' ),
			username = user.getName(),
			data = {
				name: name,
				destination: destination,
				mobileMode: M.getMode()
			};

		if ( username ) {
			data.username = username;
			data.userEditCount = mw.config.get( 'wgUserEditCount' );
		}
		return M.log( 'MobileWebClickTracking', data );
	}

	/*
	 * Using localStorage track an event but delay recording it on the
	 * server until the next page load
	 *
	 * @method
	 * @param {string} name of click tracking event to log
	 * @param {string} href the link that has been clicked.
	 */
	function futureLog( name, href ) {
		s.save( 'MobileWebClickTracking-name', name );
		s.save( 'MobileWebClickTracking-href', href );
	}

	/**
	 * Record a click to a link in the schema
	 *
	 * @method
	 * @param {string} selector of element
	 * @param {string} name unique to this click tracking event that will allow you to distinguish
	 *  it from others.
	 */
	function hijackLink( selector, name ) {
		$( selector ).on( 'click', function () {
			futureLog( name, $( this ).attr( 'href' ) );
		} );
	}

	/**
	 * Log a past click tracking event to the server.
	 *
	 * @method
	 */
	function logPastEvent() {
		var name = s.get( 'MobileWebClickTracking-name' ),
			href = s.get( 'MobileWebClickTracking-href' );

		// Make sure they do not log a second time...
		if ( name && href ) {
			s.remove( 'MobileWebClickTracking-name' );
			s.remove( 'MobileWebClickTracking-href' );
			// Since MobileWebEditing schema declares the dependencies to
			// EventLogging and the schema we can be confident this will always log.
			log( name, href );
		}
	}

	M.define( 'loggingSchemas/MobileWebClickTracking', {
		log: log,
		logPastEvent: logPastEvent,
		hijackLink: hijackLink
	} );
} )( mw.mobileFrontend, jQuery );
