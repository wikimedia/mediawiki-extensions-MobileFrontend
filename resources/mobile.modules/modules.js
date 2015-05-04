( function () {
	var loader;

	/**
	 * Class for managing modules
	 *
	 * A module in this context is essentially a Javascript class (not to be confused with
	 * ResourceLoader modules).
	 *
	 * @class ModuleLoader
	 */
	function ModuleLoader() {
		/**
		 * @property {Object} register of defined modules
		 * @private
		 */
		this._register = {};
	}

	ModuleLoader.prototype = {
		/**
		 * Require (import) a module previously defined using define().
		 *
		 * @param {String} id Required module id.
		 * @return {Object} Required module, can be any JavaScript object.
		 */
		require: function ( id ) {
			if ( !this._register.hasOwnProperty( id ) ) {
				throw new Error( 'Module not found: ' + id );
			}
			return this._register[ id ];
		},

		/**
		 * Define a module which can be later required (imported) using require().
		 *
		 * @param {String} id Defined module id.
		 * @param {Object} obj Defined module body, can be any JavaScript object.
		 * @return {Object}
		 */
		define: function ( id, obj ) {
			var self = this;

			if ( this._register.hasOwnProperty( id ) ) {
				throw new Error( 'Module already exists: ' + id );
			}
			this._register[ id ] = obj;
			// return an object of additionally functions to do with the registered module
			return {
				/**
				 * @see ModuleLoader#deprecate
				 * @param {Number} deprecatedId Defined module id, which is deprecated.
				 */
				deprecate: function ( deprecatedId ) {
					self.deprecate( deprecatedId, obj, id );
				}
			};
		},

		/**
		 * Deprecate a module and give an replacement (if there is any).
		 *
		 * @param {String} id Defined module id, which is deprecated.
		 * @param {Object} obj Defined module body, can be any JavaScript object.
		 * @param {String} [replacement] Give an optional replacement for this module (which
		 * needs to be already defined!)
		 */
		deprecate: function ( id, obj, replacement ) {
			var depreacteMsg;
			if ( replacement ) {
				// add an alternative for this module, if any given
				depreacteMsg = 'Use ' + replacement + ' instead.';
			}
			// register it as a deprecated one
			mw.log.deprecate( this._register, id, obj, depreacteMsg );
		}
	};

	loader = new ModuleLoader();

	/**
	 *
	 * FIXME: In a wonderful world all this could run in a file called init.js,
	 * all the above code would be core and everyone would be happy.
	 * @class mw.mobileFrontend
	 * @singleton
	 */
	mw.mobileFrontend = {
		/**
		 * @see ModuleLoader#define
		 * @return {Object}
		 */
		define: function () {
			return loader.define.apply( loader, arguments );
		},
		/**
		 * @see ModuleLoader#require
		 */
		require: function () {
			return loader.require.apply( loader, arguments );
		},
		/**
		 * @see ModuleLoader#deprecate
		 */
		deprecate: function () {
			return loader.deprecate.apply( loader, arguments );
		}
	};

	// inception to support testing (!!)
	mw.mobileFrontend.define( 'ModuleLoader', ModuleLoader );

} () );
