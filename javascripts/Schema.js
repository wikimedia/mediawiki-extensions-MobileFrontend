( function ( M, $ ) {
	var Schema,
		Class = M.require( 'Class' ),
		context = M.require( 'context' ),
		user = M.require( 'user' );

	/**
	 * @class Schema
	 * @extends Class
	 */
	Schema = Class.extend( {
		/**
		 * A set of defaults to log to the schema
		 *
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {String} defaults.mobileMode whether user is in stable beta or alpha
		 */
		defaults: {
			mobileMode: context.getMode()
		},
		/**
		 * Whether or not the logging is sampled (i.e. not recorded at 100% frequency)
		 * @property {Boolean}
		 */
		isSampled: false,
		/**
		 * Name of Schema to log to
		 * @property {String}
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
		 * Actually log event via EventLogging
		 * @method
		 * @param {Object} data to log
		 * @return {jQuery.Deferred}
		 */
		log: function ( data ) {
			if ( mw.eventLog ) {
				// Log event if logging schema is not sampled or if user falls into
				// sampling bucket (currently 50% of all users).
				// FIXME: Figure out if we need a more flexible sampling system, and if
				// so, how to implement it with the session ID.
				if ( !this.isSampled || user.getSessionId().charAt( 0 ) < 'V' ) {
					return mw.eventLog.logEvent( this.name, $.extend( this.defaults, data ) );
				} else {
					return $.Deferred().reject( 'User not in event sampling bucket.' );
				}
			} else {
				return $.Deferred().reject( 'EventLogging not installed.' );
			}
		}
	} );

	M.define( 'Schema', Schema );

}( mw.mobileFrontend, jQuery ) );
