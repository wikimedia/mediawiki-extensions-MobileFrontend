( function ( M, $ ) {
	var Schema,
		Class = M.require( 'Class' ),
		user = M.require( 'user' ),
		settings = M.require( 'settings' ),
		BEACON_SETTING_KEY = 'mobileFrontend/beacon';

	/**
	 * Loads the beacon from local storage.
	 * @ignore
	 *
	 * @returns {Array}
	 */
	function loadBeacon() {
		return JSON.parse( settings.get( BEACON_SETTING_KEY ) );
	}

	/**
	 * Saves the beacon to local storage.
	 * @ignore
	 *
	 * @param {Object} beacon
	 */
	function saveBeacon( beacon ) {
		settings.save( BEACON_SETTING_KEY, JSON.stringify( beacon ) );
	}

	/**
	 * Deletes the beacon, if there is one, from local storage.
	 * @ignore
	 */
	function deleteBeacon() {
		settings.remove( BEACON_SETTING_KEY );
	}

	// FIXME: [EL] This could be made more general if we decide to move the
	// schema class to their respective modules.
	/**
	 * Creates an instance of a schema in the `loggingSchemas` group, e.g.
	 * `factorySchema( 'MobileWebSearch' )` would return an instance of the
	 * `SchemaMobileWebSearch` class.
	 *
	 * @ignore
	 * @param {String} name
	 * @returns {Schema}
	 * @throws Error If the schema isn't defined
	 */
	function factorySchema( name ) {
		var Klass = M.require( 'loggingSchemas/Schema' + name ),
			result = new Klass;

		return result;
	}

	/**
	 * @class Schema
	 * @extends Class
	 */
	Schema = Class.extend( {
		/**
		 * A set of defaults to log to the schema
		 *
		 * @cfg {Object} defaults Default options hash.
		 */
		defaults: {},
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
		},

		/**
		 * Try to log an event after the next page load.
		 *
		 * @method
		 *
		 * @param {Object} data to log
		 */
		logBeacon: function ( data ) {
			saveBeacon( {
				schema: this.name,
				data: data
			} );
		}

	} );

	/**
	 * If a beacon was saved previously, then it is logged.
	 *
	 * If the beacon fails, then it isn't retried.
	 *
	 * @method
	 */
	Schema.flushBeacon = function () {
		var beacon = loadBeacon();

		if ( beacon && typeof beacon === 'object' ) {
			factorySchema( beacon.schema ).log( beacon.data );
		}

		deleteBeacon();
	};

	M.define( 'Schema', Schema );

}( mw.mobileFrontend, jQuery ) );
