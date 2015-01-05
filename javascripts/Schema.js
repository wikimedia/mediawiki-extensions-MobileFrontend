( function ( M, $ ) {
	var Schema,
		browser = M.require( 'browser' ),
		Class = M.require( 'Class' );

	/**
	 * @class Schema
	 * @extends Class
	 */
	Schema = Class.extend( {
		/**
		 * A set of defaults to log to the schema
		 *
		 * @type {Object}
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {String} defaults.mobileMode whether user is in stable beta or alpha
		 */
		defaults: {
			mobileMode: M.getMode()
		},
		/**
		 * Name of Schema to log to
		 * @type {String}
		 */
		name: undefined,
		/**
		 * @param {Object} defaults
		 * @param {String} [schemaName]
		*/
		initialize: function ( defaults, schemaName ) {
			defaults = $.extend( this.defaults, defaults || {} );
			if ( schemaName ) {
				this.name = schemaName;
			}
			if ( !this.name ) {
				throw new Error( 'Schema needs to define a schema name.' );
			}
			this.defaults = defaults;
			Class.prototype.initialize.apply( this, arguments );
		},
		/**
		 *
		 * @method
		 * @param {Object} data to log
		 * @return {jQuery.Deferred}
		 */
		log: function ( data ) {
			if ( mw.eventLog ) {
				return mw.eventLog.logEvent( this.name, $.extend( this.defaults, data ) );
			} else {
				return $.Deferred().reject( 'EventLogging not installed.' );
			}
		}
	} );

	/**
	 * Retrieve and, if not present, generate a random session ID
	 * (32 alphanumeric characters).
	 * FIXME: Use mw.user
	 * FIXME: Fall back to using cookies if localStorage isn't supported
	 *
	 * @method
	 * @static
	 * @return {String}
	 */
	Schema.getSessionId = function () {
		var sessionId;
		if ( !browser.supportsLocalStorage() ) {
			return '';
		}
		sessionId = localStorage.getItem( 'sessionId' );

		if ( !sessionId ) {
			// FIXME: use mw.user.generateRandomSessionId when we can,
			// as of now mediawiki.user has no mobile target (yay, targets in RL!)
			sessionId = '';
			while ( sessionId.length < 32 ) {
				// http://stackoverflow.com/a/8084248/365238
				sessionId += Math.random().toString( 36 ).slice( 2, 32 + 2 - sessionId.length );
			}
			localStorage.setItem( 'sessionId', sessionId );
		}
		return sessionId;
	};

	M.define( 'Schema', Schema );

}( mw.mobileFrontend, jQuery ) );
