( function ( M, $ ) {
	var Class = M.require( 'mobile.oo/Class' ),
		settings = M.require( 'mobile.settings/settings' ),
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
		var Klass = M.require( 'mobile.loggingSchemas/Schema' + name ),
			result = new Klass;

		return result;
	}

	/**
	 * @class Schema
	 */
	function Schema() {
		this.initialize.apply( this, arguments );
	}

	OO.mfExtend( Schema, {
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
		 * The rate at which sampling is performed
		 * @property {Number}
		 */
		samplingRate: 1 / 2,
		/**
		 * Whether the user is in the sampling bucket. Used as a cache variable.
		 * @property {Boolean|undefined}
		 * @private
		 */
		_isInBucket: undefined,

		/**
		 * Whether the user is bucketed.
		 * @returns {Boolean}
		 */
		isUserInBucket: function () {
			if ( mw.config.get( 'wgMFIgnoreEventLoggingBucketing' ) ) {
				return true;
			} else if ( this._isInBucket === undefined ) {
				this._isInBucket = this.isSampled && Math.random() <= this.samplingRate;
			}
			return this._isInBucket;
		},
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
		},

		/**
		 * Actually log event via the EventLogging subscriber.
		 *
		 * Since we have a soft dependency on the EventLogging extension, we use the
		 * `mw#track` method to log events to reduce coupling between the two extensions.
		 *
		 * @method
		 * @param {Object} data to log
		 * @return {jQuery.Deferred}
		 */
		log: function ( data ) {
			var deferred = $.Deferred();

			// Log event if logging schema is not sampled or if user is in the bucket
			if ( !this.isSampled || this.isUserInBucket() ) {
				mw.track( 'event.' + this.name, $.extend( {}, this.defaults, data ) );

				return deferred.resolve();
			}

			return deferred.reject();
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
	// FIXME: Needed to give time for Gather to update
	Schema.extend = Class.extend;
	mw.log.deprecate( Schema, 'extend', Schema.extend,
		'Schema.extend is deprecated. Do not use this. Use OO.mfExtend' );

	M.define( 'mobile.startup/Schema', Schema );

}( mw.mobileFrontend, jQuery ) );
