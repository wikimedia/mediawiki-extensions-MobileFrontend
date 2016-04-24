( function () {
	/**
	 * Class for managing modules
	 *
	 * A module in this context is essentially a Javascript class (not to be confused with
	 * ResourceLoader modules).
	 *
	 * @class ModuleLoader
	 * @extends OO.EventEmitter
	 */
	function ModuleLoader() {
		/**
		 * @property {Object} register of defined modules
		 * @private
		 */
		this._register = {};
		OO.EventEmitter.call( this );
	}

	ModuleLoader.prototype = {
		/**
		 * Require (import) a module previously defined using define().
		 * Searches core module registry using mw.loader.require before consulting
		 * its own local registry. This method is deprecated, please do not use.
		 *
		 * @param {String} id Required module id.
		 * @return {Object} Required module, can be any JavaScript object.
		 */
		require: function ( id ) {
			var module, args,
				registry = this._register;

			/**
			 * @ignore
			 */
			function localRequire() {
				if ( !registry.hasOwnProperty( id ) ) {
					throw new Error( 'MobileFrontend Module not found: ' + id );
				}
				return registry[ id ];
			}
			args = id.split( '/' );
			try {
				module = mw.loader.require( args[0] );
				if ( module[ args[1] ] ) {
					return module[ args[1] ];
				} else {
					return localRequire();
				}
			} catch ( e ) {
				return localRequire();
			}
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
				 * @param {String} deprecatedId Defined module id, which is deprecated.
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
	OO.mixinClass( ModuleLoader, OO.EventEmitter );

	/**
	 *
	 * FIXME: In a wonderful world all this could run in a file called init.js,
	 * all the above code would be core and everyone would be happy.
	 * @class mw.mobileFrontend
	 * @singleton
	 */
	mw.mobileFrontend = new ModuleLoader();

	// inception to support testing (!!)
	module.exports.ModuleLoader = ModuleLoader;
	mw.mobileFrontend.define( 'ModuleLoader', ModuleLoader );

}() );
