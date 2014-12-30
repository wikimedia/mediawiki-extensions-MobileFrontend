// Utility library for tracking clicks on certain elements
( function ( M, $ ) {

	var s = M.require( 'settings' ),
		MobileWebClickTracking;

	/**
	 * Check whether 'schema' is one of the predefined schemas.
	 * @param {String} [schema] name. Possible values are:
	 *   * Watchlist
	 *   * Diff
	 *   * MainMenu
	 *   * UI
	 * @ignore
	 * @throws Error when bad schema name given.
	 */
	function assertSchema( schema ) {
		var schemas = [ 'Watchlist', 'Diff', 'MainMenu', 'UI' ];

		if ( $.inArray( schema, schemas ) === -1 ) {
			throw new Error(
				'Invalid schema "' + schema + '". ' +
				'Possible values are: "' + schemas.join( '", "' ) + '".'
			);
		}
	}

	/**
	 * Track an event and record it. Throw an error if schema is not
	 * one of the predefined values.
	 *
	 * @method
	 * @ignore
	 * @param {String} [schema] name. Possible values are:
	 *   * Watchlist
	 *   * Diff
	 *   * MainMenu
	 *   * UI
	 * @param {String} name of click tracking event to log
	 * @param {String} [destination] of the link that has been clicked if applicable.
	 * @returns {jQuery.Deferred}
	 */
	function log( schema, name, destination ) {
		assertSchema( schema );
		var user = M.require( 'user' ),
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
		return M.log( 'MobileWeb' + schema + 'ClickTracking', data );
	}

	/**
	 * Using localStorage track an event but delay recording it on the
	 * server until the next page load. Throw an error if schema is not
	 * one of the predefined values.
	 *
	 * @method
	 * @ignore
	 * @param {String} [schema] name. Possible values are:
	 *   * Watchlist
	 *   * Diff
	 *   * MainMenu
	 *   * UI
	 * @param {String} name of click tracking event to log
	 * @param {String} href the link that has been clicked.
	 */
	function futureLog( schema, name, href ) {
		assertSchema( schema );
		s.save( 'MobileWebClickTracking-schema', schema );
		s.save( 'MobileWebClickTracking-name', name );
		s.save( 'MobileWebClickTracking-href', href );
	}

	/**
	 * Record a click to a link in the schema. Throw an error if schema is not
	 * one of the predefined values.
	 *
	 * @method
	 * @ignore
	 * @param {String} [schema] name. Possible values are:
	 *   * Watchlist
	 *   * Diff
	 *   * MainMenu
	 *   * UI
	 * @param {String} selector of element
	 * @param {String} name unique to this click tracking event that will allow
	 * you to distinguish it from others.
	 */
	function hijackLink( schema, selector, name ) {
		assertSchema( schema );
		$( selector ).on( 'click', function () {
			futureLog( schema, name, $( this ).attr( 'href' ) );
		} );
	}

	/**
	 * Log a past click tracking event to the server.
	 *
	 * @ignore
	 * @method
	 */
	function logPastEvent() {
		var schema = s.get( 'MobileWebClickTracking-schema' ),
			name = s.get( 'MobileWebClickTracking-name' ),
			href = s.get( 'MobileWebClickTracking-href' );

		// Make sure they do not log a second time...
		if ( schema && name && href ) {
			s.remove( 'MobileWebClickTracking-schema' );
			s.remove( 'MobileWebClickTracking-name' );
			s.remove( 'MobileWebClickTracking-href' );
			// Since MobileWebEditing schema declares the dependencies to
			// EventLogging and the schema we can be confident this will always log.
			log( schema, name, href );
		}
	}

	/**
	 * @class MobileWebClickTracking
	 * @singleton
	 */
	MobileWebClickTracking = {
		log: log,
		logPastEvent: logPastEvent,
		hijackLink: hijackLink
	};
	M.define( 'loggingSchemas/MobileWebClickTracking', MobileWebClickTracking );
} )( mw.mobileFrontend, jQuery );
