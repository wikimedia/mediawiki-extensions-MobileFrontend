( function ( M, $ ) {
	var Schema,
		Class = M.require( 'Class' );

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
			mobileMode: M.getMode()
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

	M.define( 'Schema', Schema );

}( mw.mobileFrontend, jQuery ) );
